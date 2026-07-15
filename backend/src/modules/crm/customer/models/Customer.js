import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true },
  zipCode: { type: String, trim: true }
}, { _id: false });

const customerSchema = new mongoose.Schema({
  customerCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    index: true,
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
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
  industry: {
    type: String,
    trim: true,
    index: true,
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  city: String,
  state: String,
  country: String,
  assignedSalesPerson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  status: {
    type: String,
    enum: ['LEAD', 'ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
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

// Indexes for fast lookup on name/email/company name
customerSchema.index({ customerName: 'text', companyName: 'text', email: 'text' });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
