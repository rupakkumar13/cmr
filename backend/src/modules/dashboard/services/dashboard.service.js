import mongoose from 'mongoose';

// Import models dynamically to prevent load order cycle issues
import Employee from '../../hr/models/Employee.js';
import Department from '../../hr/models/Department.js';
import Customer from '../../crm/customer/models/Customer.js';
import Lead from '../../crm/lead/models/Lead.js';
import Deal from '../../crm/deal/models/Deal.js';
import Product from '../../inventory/models/Product.js';
import Supplier from '../../inventory/models/Supplier.js';
import PurchaseOrder from '../../inventory/models/PurchaseOrder.js';
import Invoice from '../../billing/invoice/models/Invoice.js';
import Payment from '../../billing/payment/models/Payment.js';

class DashboardService {
  async getSummary() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const yearStart = new Date();
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);

    // HR metrics
    const totalEmployees = await Employee.countDocuments({ status: { $ne: 'TERMINATED' } });
    const totalDepartments = await Department.countDocuments({});

    // CRM metrics
    const totalCustomers = await Customer.countDocuments({ isDeleted: false });
    const totalLeads = await Lead.countDocuments({ isDeleted: false });
    const wonDeals = await Deal.countDocuments({ stage: 'CLOSED_WON', isDeleted: false });
    const lostDeals = await Deal.countDocuments({ stage: 'CLOSED_LOST', isDeleted: false });
    const totalDeals = await Deal.countDocuments({ isDeleted: false });

    // Inventory metrics
    const totalProducts = await Product.countDocuments({ isDeleted: false });
    const lowStockProducts = await Product.countDocuments({
      isDeleted: false,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    });
    const totalSuppliers = await Supplier.countDocuments({});
    const pendingPurchaseOrders = await PurchaseOrder.countDocuments({ orderStatus: 'PENDING' });

    // Billing/Revenue metrics using MongoDB Aggregation
    const revenueTodayResult = await Invoice.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ['PAID', 'PARTIALLY_PAID'] },
          invoiceDate: { $gte: todayStart, $lte: todayEnd }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' }
        }
      }
    ]);
    const revenueToday = revenueTodayResult[0]?.total || 0;

    const revenueMonthResult = await Invoice.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ['PAID', 'PARTIALLY_PAID'] },
          invoiceDate: { $gte: monthStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' }
        }
      }
    ]);
    const revenueMonth = revenueMonthResult[0]?.total || 0;

    const revenueYearResult = await Invoice.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ['PAID', 'PARTIALLY_PAID'] },
          invoiceDate: { $gte: yearStart }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amountPaid' }
        }
      }
    ]);
    const revenueYear = revenueYearResult[0]?.total || 0;

    const outstandingResult = await Invoice.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: { $in: ['UNPAID', 'PARTIALLY_PAID'] }
        }
      },
      {
        $group: {
          _id: null,
          totalPending: { $sum: '$remainingAmount' }
        }
      }
    ]);
    const pendingPayments = outstandingResult[0]?.totalPending || 0;
    const paidInvoices = await Invoice.countDocuments({ paymentStatus: 'PAID', isDeleted: false });

    return {
      hr: {
        totalEmployees,
        totalDepartments
      },
      crm: {
        totalCustomers,
        totalLeads,
        wonDeals,
        lostDeals,
        totalDeals
      },
      inventory: {
        totalProducts,
        lowStockProducts,
        totalSuppliers,
        pendingPurchaseOrders
      },
      billing: {
        revenueToday,
        revenueMonth,
        revenueYear,
        pendingPayments,
        paidInvoices
      }
    };
  }

  async getCharts() {
    // 1. Monthly Sales & Revenue (aggregate invoices grouped by month)
    const monthlyBilling = await Invoice.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$invoiceDate' },
            month: { $month: '$invoiceDate' }
          },
          sales: { $sum: '$grandTotal' },
          revenue: { $sum: '$amountPaid' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    // 2. Customer Growth (aggregate customer signups by month)
    const customerGrowth = await Customer.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // 3. Product Distribution by Category (aggregate product categories count)
    const productDistribution = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          categoryName: '$category.name',
          count: 1
        }
      }
    ]);

    // Format results to clean chart array keys
    const billingChartData = monthlyBilling.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      sales: item.sales,
      revenue: item.revenue
    }));

    const customerChartData = customerGrowth.map(item => ({
      name: `${item._id.month}/${item._id.year}`,
      customers: item.count
    }));

    const inventoryChartData = productDistribution.map(item => ({
      name: item.categoryName,
      value: item.count
    }));

    return {
      billingChartData,
      customerChartData,
      inventoryChartData
    };
  }

  async getRecentActivities() {
    const recentCustomers = await Customer.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('customerName companyName createdAt');

    const recentEmployeesRaw = await Employee.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('department', 'name')
      .populate('user', 'name');

    const recentEmployees = recentEmployeesRaw.map(emp => ({
      _id: emp._id,
      name: emp.user?.name || 'Unknown',
      designation: emp.designation,
      departmentId: emp.department,
      createdAt: emp.createdAt
    }));

    const recentInvoices = await Invoice.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('invoiceNumber grandTotal paymentStatus createdAt')
      .populate('customerId', 'customerName');

    const recentPayments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('paymentNumber amount paymentMethod createdAt')
      .populate('customerId', 'customerName');

    return {
      recentCustomers,
      recentEmployees,
      recentInvoices,
      recentPayments
    };
  }

  async getRevenueStats() {
    return this.getSummary().then(res => res.billing);
  }

  async getHRStats() {
    return this.getSummary().then(res => res.hr);
  }

  async getCRMStats() {
    return this.getSummary().then(res => res.crm);
  }

  async getInventoryStats() {
    return this.getSummary().then(res => res.inventory);
  }

  async getBillingStats() {
    return this.getSummary().then(res => res.billing);
  }
}

export default new DashboardService();
