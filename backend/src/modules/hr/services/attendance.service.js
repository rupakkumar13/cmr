import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import User from '../../auth/models/User.js';
import AppError from '../../../utils/appError.js';

// Helper to get local date in YYYY-MM-DD format
const getLocalDateString = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const adjustedDate = new Date(date.getTime() - offset * 60 * 1000);
  return adjustedDate.toISOString().split('T')[0];
};

class AttendanceService {
  async clockIn(userId) {
    // 1. Fetch Employee profile
    let employee = await Employee.findOne({ user: userId });
    if (!employee) {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate a unique Employee ID
      let employeeId;
      let existingEmp = true;
      while (existingEmp) {
        employeeId = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
        existingEmp = await Employee.findOne({ employeeId });
      }

      const designation = user.role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');

      employee = await Employee.create({
        user: userId,
        employeeId,
        designation,
        dateOfJoining: new Date(),
        status: 'ACTIVE'
      });
    }

    const todayStr = getLocalDateString();

    // 2. Check if already clocked in today
    const existing = await Attendance.findOne({
      employee: employee._id,
      date: todayStr
    });

    if (existing) {
      throw new AppError('You have already clocked in for today', 400);
    }

    // 3. Register clock-in
    const checkInTime = new Date();
    
    // Determine status (LATE if checking in after 10:00 AM)
    let status = 'PRESENT';
    const hours = checkInTime.getHours();
    if (hours >= 10) {
      status = 'LATE';
    }

    return await Attendance.create({
      employee: employee._id,
      date: todayStr,
      checkIn: checkInTime,
      status
    });
  }

  async clockOut(userId) {
    // 1. Fetch Employee profile
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    const todayStr = getLocalDateString();

    // 2. Find active clock-in session
    const record = await Attendance.findOne({
      employee: employee._id,
      date: todayStr,
      checkOut: null
    });

    if (!record) {
      throw new AppError('No active clock-in session found for today, or already clocked out.', 400);
    }

    // 3. Register clock-out and calculate duration
    const checkOutTime = new Date();
    const durationMs = checkOutTime - record.checkIn;
    const workHours = Math.round((durationMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals

    record.checkOut = checkOutTime;
    record.workHours = workHours;

    // Adjust status to HALF_DAY if worked less than 4 hours
    if (workHours < 4) {
      record.status = 'HALF_DAY';
    }

    await record.save();
    return record;
  }

  async getMyLogs(userId) {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return [];
    }

    return await Attendance.find({ employee: employee._id })
      .sort({ checkIn: -1 });
  }

  async getEmployeeLogs(employeeId) {
    return await Attendance.find({ employee: employeeId })
      .sort({ checkIn: -1 });
  }

  async getAllLogs(query = {}) {
    const filter = {};
    if (query.date) {
      filter.date = query.date;
    }
    if (query.employee) {
      filter.employee = query.employee;
    }

    return await Attendance.find(filter)
      .populate({
        path: 'employee',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ checkIn: -1 });
  }
}

export default new AttendanceService();
