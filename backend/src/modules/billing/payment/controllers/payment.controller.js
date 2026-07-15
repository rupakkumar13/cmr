import PaymentService from '../services/payment.service.js';

class PaymentController {
  async create(req, res, next) {
    try {
      const payment = await PaymentService.createPayment(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Payment recorded successfully',
        data: { payment }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const payment = await PaymentService.getPaymentById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { payment }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await PaymentService.queryPayments(req.query);
      res.status(200).json({
        status: 'success',
        results: result.payments.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { payments: result.payments }
      });
    } catch (error) {
      next(error);
    }
  }
  async updateStatus(req, res, next) {
    try {
      const payment = await PaymentService.updatePaymentStatus(req.params.id, req.body.status, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Payment status updated successfully',
        data: { payment }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
