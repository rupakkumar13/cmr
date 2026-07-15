import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee link is required'],
  },
  leaveType: {
    type: String,
    enum: ['SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID'],
    required: [true, 'Leave type is required'],
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  reason: {
    type: String,
    required: [true, 'Reason for leave is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  comments: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
