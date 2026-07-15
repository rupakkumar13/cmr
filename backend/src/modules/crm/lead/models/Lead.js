import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  leadCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  companyName: {
    type: String,
    trim: true,
    index: true,
  },
  leadName: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    default: 'Cold Call',
    trim: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'LOST'],
    default: 'NEW',
    index: true,
  },
  assignedSalesPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  convertedToCustomer: {
    type: Boolean,
    default: false,
    index: true,
  },
  convertedCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
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

leadSchema.index({ leadName: 'text', companyName: 'text', email: 'text' });

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;
