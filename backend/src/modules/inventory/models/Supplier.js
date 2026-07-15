import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  companyName: {
    type: String,
    required: [true, 'Supplier company name is required'],
    trim: true,
    index: true,
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
  gstNumber: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  billingAddress: {
    type: String,
  },
  shippingAddress: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
  },
  notes: {
    type: String,
  }
}, {
  timestamps: true
});

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
