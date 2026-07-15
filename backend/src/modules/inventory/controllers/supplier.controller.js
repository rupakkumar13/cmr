import SupplierService from '../services/supplier.service.js';

class SupplierController {
  async create(req, res, next) {
    try {
      const supplier = await SupplierService.createSupplier(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Supplier created successfully',
        data: { supplier }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const supplier = await SupplierService.getSupplierById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { supplier }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const supplier = await SupplierService.updateSupplier(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Supplier updated successfully',
        data: { supplier }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await SupplierService.deleteSupplier(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Supplier profile deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await SupplierService.querySuppliers(req.query);
      res.status(200).json({
        status: 'success',
        results: result.suppliers.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { suppliers: result.suppliers }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new SupplierController();
