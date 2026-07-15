import InvoiceService from '../services/invoice.service.js';

class InvoiceController {
  async create(req, res, next) {
    try {
      const invoice = await InvoiceService.createInvoice(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Invoice created successfully',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const invoice = await InvoiceService.getInvoiceById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const invoice = await InvoiceService.updateInvoice(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Invoice updated successfully',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await InvoiceService.softDeleteInvoice(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Invoice soft-deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await InvoiceService.queryInvoices(req.query);
      res.status(200).json({
        status: 'success',
        results: result.invoices.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { invoices: result.invoices }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const invoice = await InvoiceService.updateStatus(req.params.id, status, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Invoice status updated successfully',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  }

  async convertQuote(req, res, next) {
    try {
      const { quotationId } = req.body;
      const invoice = await InvoiceService.convertQuotationToInvoice(quotationId, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Quotation successfully converted to Invoice',
        data: { invoice }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new InvoiceController();
