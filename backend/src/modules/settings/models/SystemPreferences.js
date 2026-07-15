import mongoose from 'mongoose';

const systemPreferencesSchema = new mongoose.Schema({
  sessionExpiryHours: {
    type: Number,
    default: 24,
  },
  enableEmailAlerts: {
    type: Boolean,
    default: true,
  },
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
  defaultTaxRate: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

const SystemPreferences = mongoose.model('SystemPreferences', systemPreferencesSchema);

export default SystemPreferences;
