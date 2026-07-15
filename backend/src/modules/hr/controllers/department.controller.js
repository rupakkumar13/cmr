import DepartmentService from '../services/department.service.js';

class DepartmentController {
  async getAll(req, res, next) {
    try {
      const depts = await DepartmentService.getAllDepartments();
      res.status(200).json({
        status: 'success',
        results: depts.length,
        data: { departments: depts }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const dept = await DepartmentService.getDepartmentById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { department: dept }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const dept = await DepartmentService.createDepartment(req.body);
      res.status(201).json({
        status: 'success',
        data: { department: dept }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const dept = await DepartmentService.updateDepartment(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: { department: dept }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await DepartmentService.deleteDepartment(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DepartmentController();
