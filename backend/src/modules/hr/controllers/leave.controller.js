import LeaveService from '../services/leave.service.js';
import AppError from '../../../utils/appError.js';

class LeaveController {
  async apply(req, res, next) {
    try {
      const leave = await LeaveService.applyLeave(req.user.id, req.body);
      res.status(201).json({
        status: 'success',
        message: 'Leave application submitted successfully',
        data: { leave }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyLeaves(req, res, next) {
    try {
      const leaves = await LeaveService.getMyLeaves(req.user.id);
      res.status(200).json({
        status: 'success',
        results: leaves.length,
        data: { leaves }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const leaves = await LeaveService.getAllLeaves(req.query);
      res.status(200).json({
        status: 'success',
        results: leaves.length,
        data: { leaves }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const leave = await LeaveService.updateLeaveStatus(req.params.id, req.user.id, req.body);
      res.status(200).json({
        status: 'success',
        message: `Leave status updated to ${req.body.status}`,
        data: { leave }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LeaveController();
