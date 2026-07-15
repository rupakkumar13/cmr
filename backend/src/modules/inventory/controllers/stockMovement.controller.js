import StockMovementService from '../services/stockMovement.service.js';

class StockMovementController {
  async create(req, res, next) {
    try {
      const movement = await StockMovementService.logMovement({
        ...req.body,
        performedBy: req.user.id
      });
      res.status(201).json({
        status: 'success',
        message: 'Stock adjustment recorded successfully',
        data: { movement }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await StockMovementService.getMovements(req.query);
      res.status(200).json({
        status: 'success',
        results: result.movements.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { movements: result.movements }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new StockMovementController();
