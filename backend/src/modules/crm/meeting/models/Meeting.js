import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
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
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  participants: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  location: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'HELD', 'CANCELLED'],
    default: 'SCHEDULED',
    index: true,
  }
}, {
  timestamps: true
});

const Meeting = mongoose.model('Meeting', meetingSchema);

export default Meeting;
