import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null indicates it's role-based or broadcast
    index: true,
  },
  roles: [{
    type: String,
    enum: ['ADMIN', 'MANAGER', 'SALES', 'HR', 'EMPLOYEE'],
    index: true,
  }],
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['INFO', 'SUCCESS', 'WARNING', 'ERROR'],
    default: 'INFO',
    index: true,
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  }],
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
