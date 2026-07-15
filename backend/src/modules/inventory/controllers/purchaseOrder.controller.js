import PurchaseOrderService from '../services/purchaseOrder.service.js';

class PurchaseOrderController {
  async create(req, res, next) {
    try {
      const purchaseOrder = await PurchaseOrderService.createPurchaseOrder(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Purchase order created successfully',
        data: { purchaseOrder }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const purchaseOrder = await PurchaseOrderService.getPurchaseOrderById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { purchaseOrder }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const purchaseOrder = await PurchaseOrderService.updateStatus(req.params.id, req.body, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Purchase order status updated successfully',
        data: { purchaseOrder }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await PurchaseOrderService.queryPurchaseOrders(req.query);
      res.status(200).json({
        status: 'success',
        results: result.purchaseOrders.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { purchaseOrders: result.purchaseOrders }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PurchaseOrderController();
