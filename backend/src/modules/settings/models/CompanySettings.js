import mongoose from 'mongoose';

const companySettingsSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  taxNumber: {
    type: String,
    trim: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

const CompanySettings = mongoose.model('CompanySettings', companySettingsSchema);

export default CompanySettings;
