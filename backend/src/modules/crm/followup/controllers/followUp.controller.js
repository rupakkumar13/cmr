import FollowUpService from '../services/followUp.service.js';

class FollowUpController {
  async create(req, res, next) {
    try {
      const followUp = await FollowUpService.createFollowUp(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Follow up task created successfully',
        data: { followUp }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const followUp = await FollowUpService.getFollowUpById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { followUp }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const followUp = await FollowUpService.updateFollowUp(req.params.id, req.body, req.user.id, req.user.role);
      res.status(200).json({
        status: 'success',
        message: 'Follow up updated successfully',
        data: { followUp }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await FollowUpService.deleteFollowUp(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Follow up deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await FollowUpService.queryFollowUps(req.query);
      res.status(200).json({
        status: 'success',
        results: result.followUps.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { followUps: result.followUps }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new FollowUpController();
