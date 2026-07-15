import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Follow up task title is required'],
    trim: true,
    index: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
    index: true,
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    default: null,
    index: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'OVERDUE'],
    default: 'PENDING',
    index: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  }
}, {
  timestamps: true
});

const FollowUp = mongoose.model('FollowUp', followUpSchema);

export default FollowUp;
