import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import User from '../../auth/models/User.js';
import AppError from '../../../utils/appError.js';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

async function resolveManagerId(managerInput) {
  if (!managerInput) return null;
  const inputStr = String(managerInput).trim();
  if (!inputStr) return null;

  // If it's a valid ObjectId, check if the user actually exists
  if (objectIdRegex.test(inputStr)) {
    const userExists = await User.findById(inputStr);
    if (!userExists) {
      throw new AppError(`No manager user found with ID "${inputStr}"`, 404);
    }
    return userExists._id;
  }

  // Otherwise, search by name or email
  const user = await User.findOne({
    $or: [
      { name: new RegExp(`^${inputStr}$`, 'i') },
      { email: new RegExp(`^${inputStr}$`, 'i') },
      { name: new RegExp(inputStr, 'i') },
      { email: new RegExp(inputStr, 'i') }
    ]
  });

  if (!user) {
    throw new AppError(`No manager user found matching name or email "${inputStr}"`, 404);
  }

  return user._id;
}

class DepartmentService {
  async getAllDepartments() {
    return await Department.find()
      .populate({
        path: 'manager',
        select: 'name email role'
      });
  }

  async getDepartmentById(id) {
    const dept = await Department.findById(id)
      .populate({
        path: 'manager',
        select: 'name email role'
      });
      
    if (!dept) {
      throw new AppError('Department not found', 404);
    }
    return dept;
  }

  async createDepartment(data) {
    const existing = await Department.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Department name already exists', 400);
    }
    if (data.manager) {
      data.manager = await resolveManagerId(data.manager);
    }
    return await Department.create(data);
  }

  async updateDepartment(id, data) {
    const dept = await Department.findById(id);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    if (data.name && data.name !== dept.name) {
      const existing = await Department.findOne({ name: data.name });
      if (existing) {
        throw new AppError('Department name already exists', 400);
      }
    }

    if (data.hasOwnProperty('manager')) {
      data.manager = await resolveManagerId(data.manager);
    }

    return await Department.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async deleteDepartment(id) {
    const dept = await Department.findById(id);
    if (!dept) {
      throw new AppError('Department not found', 404);
    }

    // Check if any employee is currently assigned to this department
    const assignedEmployeesCount = await Employee.countDocuments({ department: id });
    if (assignedEmployeesCount > 0) {
      throw new AppError('Cannot delete department because employees are currently assigned to it', 400);
    }

    await Department.findByIdAndDelete(id);
    return null;
  }
}

export default new DepartmentService();
