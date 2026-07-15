import mongoose from 'mongoose';

import Invoice from '../../billing/invoice/models/Invoice.js';
import Payment from '../../billing/payment/models/Payment.js';
import Customer from '../../crm/customer/models/Customer.js';
import Employee from '../../hr/models/Employee.js';
import Department from '../../hr/models/Department.js';
import Product from '../../inventory/models/Product.js';
import Category from '../../inventory/models/Category.js';
import Supplier from '../../inventory/models/Supplier.js';
import Payroll from '../../hr/models/Payroll.js';
import User from '../../auth/models/User.js';

class ReportsService {
  buildDateAndSearchQuery(queryParams, dateField = 'createdAt', searchFields = []) {
    const { startDate, endDate, search } = queryParams;
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query[dateField] = {};
      if (startDate) {
        query[dateField].$gte = new Date(startDate);
      }
      if (endDate) {
        query[dateField].$lte = new Date(endDate);
      }
    }

    // Search query matching
    if (search && searchFields.length > 0) {
      query.$or = searchFields.map(field => ({
        [field]: new RegExp(search, 'i')
      }));
    }

    return query;
  }

  async getSalesReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'invoiceDate';
    const sortOrder = params.sortOrder || 'desc';

    const filter = this.buildDateAndSearchQuery(params, 'invoiceDate', ['invoiceNumber']);
    filter.isDeleted = false;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Invoice.countDocuments(filter);
    const data = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerName companyName')
      .populate('salesPersonId', 'name email');

    // Compile aggregate totals
    const totals = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$grandTotal' },
          totalTax: { $sum: '$tax' },
          totalDiscount: { $sum: '$discount' }
        }
      }
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      summary: {
        totalSales: totals[0]?.totalSales || 0,
        totalTax: totals[0]?.totalTax || 0,
        totalDiscount: totals[0]?.totalDiscount || 0
      }
    };
  }

  async getRevenueReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'paymentDate';
    const sortOrder = params.sortOrder || 'desc';

    const filter = this.buildDateAndSearchQuery(params, 'paymentDate', ['paymentNumber']);
    filter.paymentStatus = 'COMPLETED';

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Payment.countDocuments(filter);
    const data = await Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerName companyName')
      .populate('invoiceId', 'invoiceNumber');

    const totals = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      summary: {
        totalRevenue: totals[0]?.totalRevenue || 0
      }
    };
  }

  async getCustomersReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const filter = this.buildDateAndSearchQuery(params, 'createdAt', ['customerName', 'companyName']);
    filter.isDeleted = false;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Customer.countDocuments(filter);
    const rawCustomers = await Customer.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // For each customer, aggregate outstanding balances and paid invoices
    const data = [];
    for (const c of rawCustomers) {
      const stats = await Invoice.aggregate([
        { $match: { customerId: c._id, isDeleted: false } },
        {
          $group: {
            _id: null,
            totalInvoiced: { $sum: '$grandTotal' },
            totalPaid: { $sum: '$amountPaid' },
            totalRemaining: { $sum: '$remainingAmount' },
            invoiceCount: { $sum: 1 }
          }
        }
      ]);

      data.push({
        _id: c._id,
        customerCode: c.customerCode,
        customerName: c.customerName,
        companyName: c.companyName,
        email: c.email,
        phone: c.phone,
        totalInvoiced: stats[0]?.totalInvoiced || 0,
        totalPaid: stats[0]?.totalPaid || 0,
        totalRemaining: stats[0]?.totalRemaining || 0,
        invoiceCount: stats[0]?.invoiceCount || 0,
        createdAt: c.createdAt
      });
    }

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getEmployeesReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const { startDate, endDate, search } = params;
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      // Find matching users by name
      const matchingUsers = await User.find({
        name: new RegExp(search, 'i')
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      filter.$or = [
        { user: { $in: userIds } },
        { employeeId: new RegExp(search, 'i') },
        { designation: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Employee.countDocuments(filter);
    const rawData = await Employee.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('department', 'name')
      .populate('user', 'name email');

    const data = rawData.map(emp => {
      const obj = emp.toObject();
      return {
        ...obj,
        name: emp.user?.name || 'Unknown',
        email: emp.user?.email || ''
      };
    });

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getInventoryReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'currentStock';
    const sortOrder = params.sortOrder || 'asc';

    const filter = this.buildDateAndSearchQuery(params, 'createdAt', ['name', 'sku', 'productCode']);
    filter.isDeleted = false;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('categoryId', 'name')
      .populate('supplierId', 'companyName');

    const lowStockCount = await Product.countDocuments({
      isDeleted: false,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      summary: {
        totalSKUs: total,
        lowStockCount
      }
    };
  }

  async getInvoicesReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'invoiceDate';
    const sortOrder = params.sortOrder || 'desc';

    const filter = this.buildDateAndSearchQuery(params, 'invoiceDate', ['invoiceNumber']);
    filter.isDeleted = false;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Invoice.countDocuments(filter);
    const data = await Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerName companyName');

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getPaymentsReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'paymentDate';
    const sortOrder = params.sortOrder || 'desc';

    const filter = this.buildDateAndSearchQuery(params, 'paymentDate', ['paymentNumber']);

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Payment.countDocuments(filter);
    const data = await Payment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'customerName companyName')
      .populate('invoiceId', 'invoiceNumber');

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getPayrollReport(params) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const sortBy = params.sortBy || 'payPeriod.startDate';
    const sortOrder = params.sortOrder || 'desc';

    const { startDate, endDate, search } = params;
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      // Find matching users by name
      const matchingUsers = await User.find({
        name: new RegExp(search, 'i')
      }).select('_id');
      const userIds = matchingUsers.map(u => u._id);

      // Find matching employees
      const matchingEmployees = await Employee.find({
        $or: [
          { user: { $in: userIds } },
          { employeeId: new RegExp(search, 'i') },
          { designation: new RegExp(search, 'i') }
        ]
      }).select('_id');
      const employeeIds = matchingEmployees.map(e => e._id);

      filter.employee = { $in: employeeIds };
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const total = await Payroll.countDocuments(filter);
    const rawData = await Payroll.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'employee',
        select: 'employeeId designation user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });

    const data = rawData.map(item => {
      const obj = item.toObject();
      if (obj.employee) {
        obj.employee.name = obj.employee.user?.name || 'Unknown';
        obj.employee.email = obj.employee.user?.email || '';
      }
      return obj;
    });

    const totals = await Payroll.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalBasic: { $sum: '$basicSalary' },
          totalAllowances: { $sum: '$allowances' },
          totalDeductions: { $sum: '$deductions' },
          totalNetPay: { $sum: '$netSalary' }
        }
      }
    ]);

    return {
      data,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      summary: {
        totalBasic: totals[0]?.totalBasic || 0,
        totalAllowances: totals[0]?.totalAllowances || 0,
        totalDeductions: totals[0]?.totalDeductions || 0,
        totalNetPay: totals[0]?.totalNetPay || 0
      }
    };
  }
}

export default new ReportsService();
