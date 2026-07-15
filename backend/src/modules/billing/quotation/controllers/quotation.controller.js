import QuotationService from '../services/quotation.service.js';

class QuotationController {
  async create(req, res, next) {
    try {
      const quotation = await QuotationService.createQuotation(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Quotation created successfully',
        data: { quotation }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const quotation = await QuotationService.getQuotationById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { quotation }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const quotation = await QuotationService.updateQuotation(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Quotation updated successfully',
        data: { quotation }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const quotation = await QuotationService.updateStatus(req.params.id, req.body.status);
      res.status(200).json({
        status: 'success',
        message: 'Quotation status updated successfully',
        data: { quotation }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await QuotationService.softDeleteQuotation(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Quotation deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await QuotationService.queryQuotations(req.query);
      res.status(200).json({
        status: 'success',
        results: result.quotations.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { quotations: result.quotations }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new QuotationController();
