import AttendanceService from '../services/attendance.service.js';
import Employee from '../models/Employee.js';
import AppError from '../../../utils/appError.js';

class AttendanceController {
  async clockIn(req, res, next) {
    try {
      const record = await AttendanceService.clockIn(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Clock-in successful',
        data: { attendance: record }
      });
    } catch (error) {
      next(error);
    }
  }

  async clockOut(req, res, next) {
    try {
      const record = await AttendanceService.clockOut(req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Clock-out successful',
        data: { attendance: record }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLogs(req, res, next) {
    try {
      const logs = await AttendanceService.getMyLogs(req.user.id);
      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByEmployeeId(req, res, next) {
    try {
      // RBAC check: allowed roles (ADMIN/HR/MANAGER) can fetch any, others can only fetch their own
      const isPrivileged = ['ADMIN', 'HR', 'MANAGER'].includes(req.user.role);
      if (!isPrivileged) {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee || employee._id.toString() !== req.params.employeeId) {
          return next(new AppError('You are not authorized to view these logs', 403));
        }
      }

      const logs = await AttendanceService.getEmployeeLogs(req.params.employeeId);
      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const logs = await AttendanceService.getAllLogs(req.query);
      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AttendanceController();
