import Notification from '../models/Notification.js';
import { getIO } from '../../../utils/socket.js';
import AppError from '../../../utils/appError.js';

class NotificationService {
  async createNotification(data) {
    const notification = await Notification.create(data);

    // Emit real-time updates via Socket.io room bindings
    try {
      const io = getIO();
      if (notification.userId) {
        io.to(`user_${notification.userId}`).emit('notification', notification);
        console.log(`Realtime notification emitted directly to user_${notification.userId}`);
      } else if (notification.roles && notification.roles.length > 0) {
        notification.roles.forEach((r) => {
          io.to(`role_${r}`).emit('notification', notification);
          console.log(`Realtime notification emitted to role room role_${r}`);
        });
      }
    } catch (err) {
      console.warn('Real-time notification emit failed (Socket.io likely not initialized in this environment):', err.message);
    }

    return notification;
  }

  async getUserNotifications(userId, role) {
    const list = await Notification.find({
      isDeleted: false,
      $or: [
        { userId },
        { roles: role }
      ]
    }).sort({ createdAt: -1 }).limit(50);

    // Post-fetch check to resolve isRead fields on role-based notifications
    return list.map((item) => {
      const doc = item.toObject();
      if (!doc.userId) {
        doc.isRead = item.readBy.some(id => String(id) === String(userId));
      }
      return doc;
    });
  }

  async markAsRead(id, userId) {
    const notification = await Notification.findOne({ _id: id, isDeleted: false });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId) {
      notification.isRead = true;
    } else {
      // Add user to readBy array if they haven't marked it yet
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId, role) {
    // 1. Mark direct notifications as read
    await Notification.updateMany(
      { userId, isDeleted: false, isRead: false },
      { $set: { isRead: true } }
    );

    // 2. Mark matching role-based notifications as read
    await Notification.updateMany(
      { roles: role, isDeleted: false, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return { status: 'success' };
  }

  async softDeleteNotification(id) {
    const notification = await Notification.findOne({ _id: id, isDeleted: false });
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    notification.isDeleted = true;
    notification.deletedAt = new Date();
    await notification.save();

    return null;
  }
}

export default new NotificationService();
