import LeadService from '../services/lead.service.js';

class LeadController {
  async create(req, res, next) {
    try {
      const lead = await LeadService.createLead(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Lead created successfully',
        data: { lead }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const lead = await LeadService.getLeadById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { lead }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const lead = await LeadService.updateLead(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        message: 'Lead updated successfully',
        data: { lead }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await LeadService.softDeleteLead(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Lead profile soft-deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await LeadService.queryLeads(req.query);
      res.status(200).json({
        status: 'success',
        results: result.leads.length,
        total: result.totalLeads,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { leads: result.leads }
      });
    } catch (error) {
      next(error);
    }
  }

  async convert(req, res, next) {
    try {
      const customer = await LeadService.convertLeadToCustomer(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Lead successfully converted into Customer record',
        data: { customer }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new LeadController();
