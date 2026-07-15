import CompanySettings from '../models/CompanySettings.js';
import SystemPreferences from '../models/SystemPreferences.js';
import User from '../../auth/models/User.js';
import AppError from '../../../utils/appError.js';

class SettingsService {
  async getCompanySettings() {
    let settings = await CompanySettings.findOne({});
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'Default ERP Monolith LLC',
        currency: 'USD',
        contactEmail: 'admin@monolith.com'
      });
    }
    return settings;
  }

  async updateCompanySettings(data) {
    let settings = await CompanySettings.findOne({});
    if (!settings) {
      settings = await CompanySettings.create(data);
    } else {
      settings = await CompanySettings.findByIdAndUpdate(settings._id, data, {
        new: true,
        runValidators: true
      });
    }
    return settings;
  }

  async getSystemPreferences() {
    let preferences = await SystemPreferences.findOne({});
    if (!preferences) {
      preferences = await SystemPreferences.create({
        sessionExpiryHours: 24,
        enableEmailAlerts: true,
        lowStockThreshold: 5,
        defaultTaxRate: 0
      });
    }
    return preferences;
  }

  async updateSystemPreferences(data) {
    let preferences = await SystemPreferences.findOne({});
    if (!preferences) {
      preferences = await SystemPreferences.create(data);
    } else {
      preferences = await SystemPreferences.findByIdAndUpdate(preferences._id, data, {
        new: true,
        runValidators: true
      });
    }
    return preferences;
  }

  async updateUserProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Strip unmodifiable values
    delete data.password;
    delete data.role;
    delete data.isVerified;

    const updated = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true
    });
    return updated;
  }

  async changeUserPassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();
    return { status: 'success' };
  }
}

export default new SettingsService();
