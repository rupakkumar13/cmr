import express from 'express';
import DepartmentController from '../controllers/department.controller.js';
import EmployeeController from '../controllers/employee.controller.js';
import AttendanceController from '../controllers/attendance.controller.js';
import LeaveController from '../controllers/leave.controller.js';
import PayrollController from '../controllers/payroll.controller.js';
import validate from '../../../middleware/validate.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  applyLeaveSchema,
  updateLeaveStatusSchema,
  createPayrollSchema
} from '../validators/hr.validator.js';

const router = express.Router();

// Enforce authentication across all HR endpoints
router.use(authenticate);

/* ==========================================================================
   Department Module Routes
   ========================================================================== */
router.get('/departments', authorize('ADMIN', 'HR'), DepartmentController.getAll);
router.get('/departments/:id', authorize('ADMIN', 'HR'), DepartmentController.getById);
router.post('/departments', authorize('ADMIN', 'HR'), validate(createDepartmentSchema), DepartmentController.create);
router.put('/departments/:id', authorize('ADMIN', 'HR'), validate(updateDepartmentSchema), DepartmentController.update);
router.delete('/departments/:id', authorize('ADMIN', 'HR'), DepartmentController.delete);

/* ==========================================================================
   Employee Profile Module Routes
   ========================================================================== */
router.get('/employees/me', EmployeeController.getMe);
router.get('/employees', authorize('ADMIN', 'HR'), EmployeeController.getAll);
router.get('/employees/:id', authorize('ADMIN', 'HR', 'SALES', 'MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT', 'EMPLOYEE'), EmployeeController.getById);
router.post('/employees', authorize('ADMIN', 'HR'), validate(createEmployeeSchema), EmployeeController.create);
router.put('/employees/:id', authorize('ADMIN', 'HR'), validate(updateEmployeeSchema), EmployeeController.update);
router.post('/employees/:id/documents', authorize('ADMIN', 'HR', 'SALES', 'MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT', 'EMPLOYEE'), EmployeeController.uploadDoc);

/* ==========================================================================
   Attendance Module Routes
   ========================================================================== */
router.post('/attendance/clock-in', AttendanceController.clockIn);
router.post('/attendance/clock-out', AttendanceController.clockOut);
router.get('/attendance/my-attendance', AttendanceController.getMyLogs);
router.get('/attendance/employee/:employeeId', authorize('ADMIN', 'HR', 'SALES', 'MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT', 'EMPLOYEE'), AttendanceController.getByEmployeeId);
router.get('/attendance', authorize('ADMIN', 'HR'), AttendanceController.getAll);

/* ==========================================================================
   Leave Module Routes
   ========================================================================== */
router.post('/leaves', validate(applyLeaveSchema), LeaveController.apply);
router.get('/leaves/my-leaves', LeaveController.getMyLeaves);
router.get('/leaves', authorize('ADMIN', 'HR'), LeaveController.getAll);
router.patch('/leaves/:id/status', authorize('ADMIN', 'HR'), validate(updateLeaveStatusSchema), LeaveController.updateStatus);

/* ==========================================================================
   Payroll Module Routes
   ========================================================================== */
router.post('/payroll', authorize('ADMIN', 'HR'), validate(createPayrollSchema), PayrollController.create);
router.get('/payroll/my-payroll', PayrollController.getMyPayslips);
router.get('/payroll/employee/:employeeId', authorize('ADMIN', 'HR', 'SALES', 'MANAGER', 'INVENTORY_MANAGER', 'ACCOUNTANT', 'EMPLOYEE'), PayrollController.getByEmployeeId);
router.get('/payroll', authorize('ADMIN', 'HR'), PayrollController.getAll);
router.patch('/payroll/:id/pay', authorize('ADMIN', 'HR'), PayrollController.markPaid);

export default router;
