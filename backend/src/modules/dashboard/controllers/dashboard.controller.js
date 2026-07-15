import DashboardService from '../services/dashboard.service.js';

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await DashboardService.getSummary();
      res.status(200).json({
        status: 'success',
        data: { summary }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCharts(req, res, next) {
    try {
      const charts = await DashboardService.getCharts();
      res.status(200).json({
        status: 'success',
        data: { charts }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivities(req, res, next) {
    try {
      const activities = await DashboardService.getRecentActivities();
      res.status(200).json({
        status: 'success',
        data: { activities }
      });
    } catch (error) {
      next(error);
    }
  }

  async getRevenue(req, res, next) {
    try {
      const revenue = await DashboardService.getRevenueStats();
      res.status(200).json({
        status: 'success',
        data: { revenue }
      });
    } catch (error) {
      next(error);
    }
  }

  async getHR(req, res, next) {
    try {
      const hr = await DashboardService.getHRStats();
      res.status(200).json({
        status: 'success',
        data: { hr }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCRM(req, res, next) {
    try {
      const crm = await DashboardService.getCRMStats();
      res.status(200).json({
        status: 'success',
        data: { crm }
      });
    } catch (error) {
      next(error);
    }
  }

  async getInventory(req, res, next) {
    try {
      const inventory = await DashboardService.getInventoryStats();
      res.status(200).json({
        status: 'success',
        data: { inventory }
      });
    } catch (error) {
      next(error);
    }
  }

  async getBilling(req, res, next) {
    try {
      const billing = await DashboardService.getBillingStats();
      res.status(200).json({
        status: 'success',
        data: { billing }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();
