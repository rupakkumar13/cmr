import Employee from '../models/Employee.js';
import User from '../../auth/models/User.js';
import AppError from '../../../utils/appError.js';

class EmployeeService {
  async getAllEmployees(query = {}) {
    const filter = {};
    
    // Support filtering
    if (query.department) {
      filter.department = query.department;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.designation) {
      filter.designation = new RegExp(query.designation, 'i');
    }

    let employeesQuery = Employee.find(filter)
      .populate('department')
      .populate({
        path: 'user',
        select: 'name email role isVerified'
      });

    const employees = await employeesQuery;

    // Filter by name/email on populated fields if query exists
    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      return employees.filter(emp => 
        (emp.user && searchRegex.test(emp.user.name)) || 
        (emp.user && searchRegex.test(emp.user.email)) ||
        searchRegex.test(emp.employeeId)
      );
    }

    return employees;
  }

  async getEmployeeById(id) {
    const employee = await Employee.findById(id)
      .populate('department')
      .populate({
        path: 'user',
        select: 'name email role isVerified'
      });
      
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }
    return employee;
  }

  async getEmployeeByUserId(userId) {
    const employee = await Employee.findOne({ user: userId })
      .populate('department')
      .populate({
        path: 'user',
        select: 'name email role isVerified'
      });
      
    if (!employee) {
      throw new AppError('Employee profile not found for this user', 404);
    }
    return employee;
  }

  async createEmployee(data) {
    // 1. Verify that the User account exists
    const user = await User.findById(data.user);
    if (!user) {
      throw new AppError('Linked user account not found', 404);
    }

    // 2. Check if this User already has an Employee profile
    const existingProfile = await Employee.findOne({ user: data.user });
    if (existingProfile) {
      throw new AppError('Employee profile already exists for this user account', 400);
    }

    // 3. Check if EmployeeId is unique
    const existingId = await Employee.findOne({ employeeId: data.employeeId });
    if (existingId) {
      throw new AppError('Employee ID already exists', 400);
    }

    return await Employee.create(data);
  }

  async updateEmployee(id, data) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    // Don't allow changing the User account once linked
    delete data.user;

    return await Employee.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate('department').populate('user');
  }

  async uploadDocument(id, documentData) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new AppError('Employee profile not found', 404);
    }

    employee.documents.push({
      name: documentData.name,
      url: documentData.url,
      uploadedAt: new Date()
    });

    await employee.save();
    return employee;
  }
}

export default new EmployeeService();
