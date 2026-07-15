import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ['CUSTOMER', 'LEAD', 'DEAL', 'MEETING', 'FOLLOWUP'],
    required: true,
    index: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  }
}, {
  timestamps: true
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
