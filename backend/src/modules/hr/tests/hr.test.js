import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../auth/models/User.js';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';

import DepartmentService from '../services/department.service.js';
import EmployeeService from '../services/employee.service.js';
import AttendanceService from '../services/attendance.service.js';
import LeaveService from '../services/leave.service.js';
import PayrollService from '../services/payroll.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting HR Module Unit & Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    // 0. Cleanup old test items
    const mgrEmail = 'test_mgr_hr@example.com';
    const empEmail = 'test_emp_hr@example.com';
    
    const oldMgr = await User.findOne({ email: mgrEmail });
    const oldEmp = await User.findOne({ email: empEmail });
    
    if (oldEmp) {
      const empProfile = await Employee.findOne({ user: oldEmp._id });
      if (empProfile) {
        await Attendance.deleteMany({ employee: empProfile._id });
        await Leave.deleteMany({ employee: empProfile._id });
        await Payroll.deleteMany({ employee: empProfile._id });
        await Employee.deleteOne({ _id: empProfile._id });
      }
      await User.deleteOne({ _id: oldEmp._id });
    }
    if (oldMgr) {
      await Department.deleteMany({ manager: oldMgr._id });
      await User.deleteOne({ _id: oldMgr._id });
    }
    
    await Department.deleteMany({ name: 'Engineering Test Department' });
    console.log('🧹 Cleaned up old test data.');

    // 1. Create Users
    console.log('\n📝 Creating Test Users...');
    const managerUser = await User.create({
      name: 'HR Manager Tester',
      email: mgrEmail,
      password: 'testPassword123',
      role: 'HR',
      isVerified: true
    });
    
    const regularUser = await User.create({
      name: 'Employee Tester',
      email: empEmail,
      password: 'testPassword123',
      role: 'EMPLOYEE',
      isVerified: true
    });
    console.log('✅ Test users registered.');

    // 2. Test Department CRUD
    console.log('\n🏢 Testing Department Service...');
    const dept = await DepartmentService.createDepartment({
      name: 'Engineering Test Department',
      manager: managerUser._id,
      description: 'Department for automated testing runs'
    });
    console.log('✅ Department created:', dept.name);

    // 3. Test Employee Onboarding
    console.log('\n👤 Testing Employee Onboarding Service...');
    const employeeProfile = await EmployeeService.createEmployee({
      user: regularUser._id,
      employeeId: 'EMP-T1001',
      department: dept._id,
      designation: 'Software Developer In Test',
      dateOfJoining: new Date(),
      personalInfo: {
        gender: 'MALE',
        phoneNumber: '1234567890',
        address: '123 Test Street'
      }
    });
    console.log('✅ Employee profile created:', employeeProfile.employeeId);

    // Test duplicate profile prevention
    try {
      await EmployeeService.createEmployee({
        user: regularUser._id,
        employeeId: 'EMP-T1002',
        designation: 'Staff Dev',
        dateOfJoining: new Date()
      });
      console.error('❌ Error: Allowed duplicate Employee profile creation!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Prevented duplicate employee profile correctly:', err.message);
    }

    // 4. Test Attendance (Clock-In & Clock-Out)
    console.log('\n⏰ Testing Attendance Clock-In & Clock-Out...');
    const clockInRecord = await AttendanceService.clockIn(regularUser._id);
    console.log('✅ Clocked in successfully. Status:', clockInRecord.status);

    // Test duplicate clock-in block
    try {
      await AttendanceService.clockIn(regularUser._id);
      console.error('❌ Error: Allowed duplicate clock-in on same day!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Prevented duplicate clock-in correctly:', err.message);
    }

    // Clock-Out
    const clockOutRecord = await AttendanceService.clockOut(regularUser._id);
    console.log('✅ Clocked out successfully. Duration (Hrs):', clockOutRecord.workHours);

    // 5. Test Leaves
    console.log('\n📅 Testing Leave Applications & Approvals...');
    const leave = await LeaveService.applyLeave(regularUser._id, {
      leaveType: 'CASUAL',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
      reason: 'Automated test casual leave application'
    });
    console.log('✅ Leave request applied. Current status:', leave.status);

    // Manager approval
    const approvedLeave = await LeaveService.updateLeaveStatus(leave._id, managerUser._id, {
      status: 'APPROVED',
      comments: 'Approved via automated test suite run'
    });
    console.log('✅ Leave status updated. New status:', approvedLeave.status, 'Approved By:', managerUser.name);

    // 6. Test Payroll
    console.log('\n💵 Testing Payroll Operations...');
    const payroll = await PayrollService.createPayslip({
      employee: employeeProfile._id,
      month: 6,
      year: 2026,
      basicSalary: 60000,
      allowances: 5000,
      deductions: 2000
    });
    console.log('✅ Payslip created. Net Salary:', payroll.netSalary);

    // Test duplicate payroll block
    try {
      await PayrollService.createPayslip({
        employee: employeeProfile._id,
        month: 6,
        year: 2026,
        basicSalary: 60000
      });
      console.error('❌ Error: Allowed duplicate payslip generation for same month/year!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Prevented duplicate payslip correctly:', err.message);
    }

    // Mark paid
    const paidPayroll = await PayrollService.markAsPaid(payroll._id);
    console.log('✅ Payslip payment completed. Status:', paidPayroll.status, 'Paid At:', paidPayroll.paymentDate);

    // 7. Cleanup
    console.log('\n🧹 Cleaning up test database items...');
    await Attendance.deleteOne({ _id: clockInRecord._id });
    await Leave.deleteOne({ _id: leave._id });
    await Payroll.deleteOne({ _id: payroll._id });
    await Employee.deleteOne({ _id: employeeProfile._id });
    await Department.deleteOne({ _id: dept._id });
    await User.deleteOne({ _id: regularUser._id });
    await User.deleteOne({ _id: managerUser._id });
    
    console.log('✅ Cleanup completed.');
    console.log('\n🎉 ALL HR MODULE BACKEND TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration test run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
