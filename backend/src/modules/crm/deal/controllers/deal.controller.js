import DealService from '../services/deal.service.js';
import AppError from '../../../../utils/appError.js';

class DealController {
  async create(req, res, next) {
    try {
      const deal = await DealService.createDeal(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Deal created successfully',
        data: { deal }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const deal = await DealService.getDealById(req.params.id);
      if (req.user.role === 'SALES' && deal.assignedSalesPerson && String(deal.assignedSalesPerson._id || deal.assignedSalesPerson) !== String(req.user.id)) {
        return next(new AppError('You do not have permission to view this deal', 403));
      }
      res.status(200).json({
        status: 'success',
        data: { deal }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const deal = await DealService.getDealById(req.params.id);
      if (req.user.role === 'SALES' && deal.assignedSalesPerson && String(deal.assignedSalesPerson._id || deal.assignedSalesPerson) !== String(req.user.id)) {
        return next(new AppError('You do not have permission to update this deal', 403));
      }
      const updated = await DealService.updateDeal(req.params.id, req.body, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Deal updated successfully',
        data: { deal: updated }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deal = await DealService.getDealById(req.params.id);
      if (req.user.role === 'SALES' && deal.assignedSalesPerson && String(deal.assignedSalesPerson._id || deal.assignedSalesPerson) !== String(req.user.id)) {
        return next(new AppError('You do not have permission to delete this deal', 403));
      }
      await DealService.softDeleteDeal(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Deal soft-deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      if (req.user.role === 'SALES') {
        req.query.assignedSalesPerson = req.user.id;
      }
      const result = await DealService.queryDeals(req.query);
      res.status(200).json({
        status: 'success',
        results: result.deals.length,
        total: result.totalDeals,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { deals: result.deals }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DealController();
