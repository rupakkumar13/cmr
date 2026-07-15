import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import AppError from '../../../utils/appError.js';

class PayrollService {
  async createPayslip(payrollData) {
    const { employee, month, year, basicSalary, allowances = 0, deductions = 0 } = payrollData;

    // 1. Verify Employee profile exists
    const emp = await Employee.findById(employee);
    if (!emp) {
      throw new AppError('Employee profile not found', 404);
    }

    // 2. Check if payroll already exists for this month/year combination
    const existing = await Payroll.findOne({ employee, month, year });
    if (existing) {
      throw new AppError(`Payslip has already been generated for this employee for ${month}/${year}`, 400);
    }

    // 3. Compute net salary
    const netSalary = basicSalary + allowances - deductions;

    return await Payroll.create({
      employee,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      status: 'UNPAID'
    });
  }

  async getMyPayslips(userId) {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    return await Payroll.find({ employee: employee._id })
      .sort({ year: -1, month: -1 });
  }

  async getEmployeePayslips(employeeId) {
    return await Payroll.find({ employee: employeeId })
      .sort({ year: -1, month: -1 });
  }

  async getAllPayslips(query = {}) {
    const filter = {};
    if (query.month) filter.month = Number(query.month);
    if (query.year) filter.year = Number(query.year);
    if (query.status) filter.status = query.status;

    return await Payroll.find(filter)
      .populate({
        path: 'employee',
        populate: {
          path: 'user',
          select: 'name email role'
        }
      })
      .sort({ year: -1, month: -1 });
  }

  async markAsPaid(payrollId) {
    const payroll = await Payroll.findById(payrollId);
    if (!payroll) {
      throw new AppError('Payroll record not found', 404);
    }

    if (payroll.status === 'PAID') {
      throw new AppError('Payslip is already marked as paid', 400);
    }

    payroll.status = 'PAID';
    payroll.paymentDate = new Date();
    
    await payroll.save();
    return payroll;
  }
}

export default new PayrollService();
