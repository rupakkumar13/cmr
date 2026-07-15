import PayrollService from '../services/payroll.service.js';
import EmployeeService from '../services/employee.service.js';
import AppError from '../../../utils/appError.js';

class PayrollController {
  async create(req, res, next) {
    try {
      const payslip = await PayrollService.createPayslip(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Payslip generated successfully',
        data: { payroll: payslip }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyPayslips(req, res, next) {
    try {
      const payslips = await PayrollService.getMyPayslips(req.user.id);
      res.status(200).json({
        status: 'success',
        results: payslips.length,
        data: { payslips }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployeeId(req, res, next) {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.employeeId);

      // RBAC check: ADMIN/HR can fetch any, others can only fetch their own payslips
      const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);
      const userIdStr = employee.user?._id ? employee.user._id.toString() : (employee.user ? employee.user.toString() : '');
      if (!isPrivileged && userIdStr !== req.user.id) {
        return next(new AppError('You are not authorized to view these payslips', 403));
      }

      const payslips = await PayrollService.getEmployeePayslips(req.params.employeeId);
      res.status(200).json({
        status: 'success',
        results: payslips.length,
        data: { payslips }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const payslips = await PayrollService.getAllPayslips(req.query);
      res.status(200).json({
        status: 'success',
        results: payslips.length,
        data: { payslips }
      });
    } catch (error) {
      next(error);
    }
  }

  async markPaid(req, res, next) {
    try {
      const payslip = await PayrollService.markAsPaid(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Payroll transaction completed and marked as PAID',
        data: { payroll: payslip }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PayrollController();
