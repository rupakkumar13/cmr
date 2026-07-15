import EmployeeService from '../services/employee.service.js';
import AppError from '../../../utils/appError.js';
import User from '../../auth/models/User.js';
import Employee from '../models/Employee.js';

class EmployeeController {
  async getAll(req, res, next) {
    try {
      const employees = await EmployeeService.getAllEmployees(req.query);
      res.status(200).json({
        status: 'success',
        results: employees.length,
        data: { employees }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      let employee;
      try {
        employee = await EmployeeService.getEmployeeByUserId(req.user.id);
      } catch (err) {
        // Auto-create employee profile for this user
        const user = await User.findById(req.user.id);
        if (!user) {
          return next(new AppError('User not found', 404));
        }

        let employeeId;
        let existingEmp = true;
        while (existingEmp) {
          employeeId = `EMP-${Math.floor(100000 + Math.random() * 900000)}`;
          existingEmp = await Employee.findOne({ employeeId });
        }

        const designation = user.role.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');

        employee = await Employee.create({
          user: req.user.id,
          employeeId,
          designation,
          dateOfJoining: new Date(),
          status: 'ACTIVE'
        });

        employee = await Employee.findById(employee._id).populate('department').populate({
          path: 'user',
          select: 'name email role isVerified'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { employee }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id);
      
      // RBAC check: allowed roles (ADMIN/HR/MANAGER) can view any, others can only view their own profile
      const isPrivileged = ['ADMIN', 'HR', 'MANAGER'].includes(req.user.role);
      const userIdStr = employee.user?._id ? employee.user._id.toString() : (employee.user ? employee.user.toString() : '');
      if (!isPrivileged && userIdStr !== req.user.id) {
        return next(new AppError('You are not authorized to view this profile', 403));
      }

      res.status(200).json({
        status: 'success',
        data: { employee }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const employee = await EmployeeService.createEmployee(req.body);
      res.status(201).json({
        status: 'success',
        data: { employee }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      // Fetch target employee profile
      const employee = await EmployeeService.getEmployeeById(req.params.id);

      // RBAC check: employees can only update their own profile, ADMIN/HR can update any
      if (req.user.role === 'EMPLOYEE' && employee.user._id.toString() !== req.user.id) {
        return next(new AppError('You are not authorized to edit this profile', 403));
      }

      // Safeguard: Employees cannot promote themselves or modify their status/department
      if (req.user.role === 'EMPLOYEE') {
        delete req.body.department;
        delete req.body.designation;
        delete req.body.status;
        delete req.body.dateOfJoining;
        delete req.body.employeeId;
      }

      const updated = await EmployeeService.updateEmployee(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { employee: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadDoc(req, res, next) {
    try {
      const employee = await EmployeeService.getEmployeeById(req.params.id);

      // RBAC check: ADMIN/HR can do for any, others can only upload to their own profile
      const isPrivileged = ['ADMIN', 'HR'].includes(req.user.role);
      const userIdStr = employee.user?._id ? employee.user._id.toString() : (employee.user ? employee.user.toString() : '');
      if (!isPrivileged && userIdStr !== req.user.id) {
        return next(new AppError('You are not authorized to upload documents for this profile', 403));
      }

      const { name, url } = req.body;
      if (!name || !url) {
        return next(new AppError('Document name and url are required', 400));
      }

      const updated = await EmployeeService.uploadDocument(req.params.id, { name, url });
      res.status(200).json({
        status: 'success',
        data: { employee: updated }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EmployeeController();
