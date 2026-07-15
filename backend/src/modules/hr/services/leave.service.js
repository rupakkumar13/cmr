import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import AppError from '../../../utils/appError.js';

class LeaveService {
  async applyLeave(userId, leaveData) {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const start = new Date(leaveData.startDate);
    const end = new Date(leaveData.endDate);

    if (start > end) {
      throw new AppError('Start date must be before or equal to End date', 400);
    }

    return await Leave.create({
      employee: employee._id,
      leaveType: leaveData.leaveType,
      startDate: start,
      endDate: end,
      reason: leaveData.reason,
      status: 'PENDING'
    });
  }

  async getMyLeaves(userId) {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    return await Leave.find({ employee: employee._id })
      .sort({ createdAt: -1 });
  }

  async getAllLeaves(query = {}) {
    const filter = {};
    if (query.status) {
      filter.status = query.status;
    }

    return await Leave.find(filter)
      .populate({
        path: 'employee',
        populate: {
          path: 'user',
          select: 'name email role'
        }
      })
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });
  }

  async updateLeaveStatus(leaveId, authorizerId, statusData) {
    const leave = await Leave.findById(leaveId);
    if (!leave) {
      throw new AppError('Leave request not found', 404);
    }

    if (leave.status !== 'PENDING') {
      throw new AppError('Cannot update status of a leave request that is already approved or rejected', 400);
    }

    leave.status = statusData.status;
    leave.approvedBy = authorizerId;
    leave.comments = statusData.comments || '';

    await leave.save();
    return leave;
  }
}

export default new LeaveService();
