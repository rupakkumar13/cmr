import NotificationService from '../services/notification.service.js';

class NotificationController {
  async create(req, res, next) {
    try {
      const notification = await NotificationService.createNotification(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Notification generated successfully',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const list = await NotificationService.getUserNotifications(req.user.id, req.user.role);
      res.status(200).json({
        status: 'success',
        results: list.length,
        data: { notifications: list }
      });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
        data: { notification }
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.id, req.user.role);
      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await NotificationService.softDeleteNotification(req.params.id);
      res.status(200).json({
        status: 'success',
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
