import ActivityLogService from '../services/activityLog.service.js';

class ActivityLogController {
  async getAll(req, res, next) {
    try {
      const logs = await ActivityLogService.getAllLogs(req.query);
      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }

  async getByEntity(req, res, next) {
    try {
      const logs = await ActivityLogService.getActivityLogsForEntity(req.params.entityId);
      res.status(200).json({
        status: 'success',
        results: logs.length,
        data: { logs }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ActivityLogController();
