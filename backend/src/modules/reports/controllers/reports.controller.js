import ReportsService from '../services/reports.service.js';

class ReportsController {
  async getSales(req, res, next) {
    try {
      const result = await ReportsService.getSalesReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenue(req, res, next) {
    try {
      const result = await ReportsService.getRevenueReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const result = await ReportsService.getCustomersReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployees(req, res, next) {
    try {
      const result = await ReportsService.getEmployeesReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventory(req, res, next) {
    try {
      const result = await ReportsService.getInventoryReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const result = await ReportsService.getInvoicesReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const result = await ReportsService.getPaymentsReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayroll(req, res, next) {
    try {
      const result = await ReportsService.getPayrollReport(req.query);
      res.status(200).json({
        status: 'success',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportsController();
