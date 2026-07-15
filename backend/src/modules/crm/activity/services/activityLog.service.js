import ActivityLog from '../models/ActivityLog.js';

class ActivityLogService {
  async logActivity({ entityType, entityId, action, description, performedBy }) {
    try {
      return await ActivityLog.create({
        entityType,
        entityId,
        action,
        description,
        performedBy
      });
    } catch (err) {
      console.error('Failed to write activity logs:', err.message);
      // Fail silently to avoid breaking main transactional operations
      return null;
    }
  }

  async getActivityLogsForEntity(entityId) {
    return await ActivityLog.find({ entityId })
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  async getAllLogs(query = {}) {
    const filter = {};
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = query.entityId;

    return await ActivityLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 });
  }
}

export default new ActivityLogService();
