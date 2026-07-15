import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  dealCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true,
    index: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Associated Customer is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Deal amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  stage: {
    type: String,
    enum: ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'],
    default: 'QUALIFICATION',
    index: true,
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM',
    index: true,
  },
  company: {
    type: String,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  pipeline: {
    type: String,
    default: 'Sales Pipeline',
  },
  leadSource: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  attachments: [String],
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  expectedCloseDate: {
    type: Date,
  },
  assignedSalesPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
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

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;
