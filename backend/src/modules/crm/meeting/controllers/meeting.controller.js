import MeetingService from '../services/meeting.service.js';

class MeetingController {
  async create(req, res, next) {
    try {
      const meeting = await MeetingService.createMeeting(req.body, req.user.id);
      res.status(201).json({
        status: 'success',
        message: 'Meeting scheduled successfully',
        data: { meeting }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const meeting = await MeetingService.getMeetingById(req.params.id);
      res.status(200).json({
        status: 'success',
        data: { meeting }
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const meeting = await MeetingService.updateMeeting(req.params.id, req.body, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Meeting updated successfully',
        data: { meeting }
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await MeetingService.deleteMeeting(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Meeting cancelled and deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await MeetingService.queryMeetings(req.query);
      res.status(200).json({
        status: 'success',
        results: result.meetings.length,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        data: { meetings: result.meetings }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MeetingController();
