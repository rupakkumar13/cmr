import CustomerService from '../services/customer.service.js';

class CustomerController {
  async create(req, res, next) {
    try {
      const customer = await CustomerService.createCustomer(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Customer registered successfully',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Customer updated successfully',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await CustomerService.softDeleteCustomer(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Customer profile soft-deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await CustomerService.queryCustomers(req.query);
      res.status(200).json({
        status: 'success',
        results: result.customers.length,
        total: result.totalCustomers,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { customers: result.customers }
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      // Map dedicated search queries to Customer query service
      const result = await CustomerService.queryCustomers(req.query);
      res.status(200).json({
        status: 'success',
        results: result.customers.length,
        data: { customers: result.customers }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
