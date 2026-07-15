import dotenv from 'dotenv';
import mongoose from 'mongoose';
import CompanySettings from '../models/CompanySettings.js';
import SystemPreferences from '../models/SystemPreferences.js';
import User from '../../auth/models/User.js';
import SettingsService from '../services/settings.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Settings Module Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail = 'settings_test_user@example.com';

    // 0. Clean up previous test runs
    await CompanySettings.deleteMany({});
    await SystemPreferences.deleteMany({});
    await User.deleteMany({ email: testEmail });
    console.log('🧹 Cleaned up old settings test runs');

    // 1. Create a User with known password
    const testUser = await User.create({
      name: 'Settings Tester',
      email: testEmail,
      password: 'oldPassword123',
      role: 'ADMIN',
      isVerified: true
    });
    console.log('✅ Tester Admin registered.');

    // 2. Fetch and verify default Company settings
    console.log('\n🏢 Testing Company Settings CRUD...');
    const company = await SettingsService.getCompanySettings();
    console.log('- Default Company Name:', company.companyName);
    if (company.companyName !== 'Default ERP Monolith LLC') {
      console.error('❌ Error: Expected default company name mismatch!');
      process.exit(1);
    }

    const updatedCompany = await SettingsService.updateCompanySettings({
      companyName: 'Stark Industries LLC',
      currency: 'USD',
      taxNumber: 'TX-STARK-999'
    });
    console.log('- Updated Company Name:', updatedCompany.companyName);
    if (updatedCompany.companyName !== 'Stark Industries LLC') {
      console.error('❌ Error: Company name was not updated correctly!');
      process.exit(1);
    }
    console.log('✅ Company Settings validated successfully.');

    // 3. System Preferences verification
    console.log('\n⚙️ Testing System Preferences CRUD...');
    const preferences = await SettingsService.getSystemPreferences();
    console.log('- Default Session Expiry:', preferences.sessionExpiryHours);
    
    const updatedPrefs = await SettingsService.updateSystemPreferences({
      sessionExpiryHours: 12,
      lowStockThreshold: 10
    });
    console.log('- Updated Stock Threshold:', updatedPrefs.lowStockThreshold);
    if (updatedPrefs.lowStockThreshold !== 10 || updatedPrefs.sessionExpiryHours !== 12) {
      console.error('❌ Error: System preferences update failed!');
      process.exit(1);
    }
    console.log('✅ System Preferences validated successfully.');

    // 4. Change Password validation
    console.log('\n🔑 Testing Password Change rotation...');
    const res = await SettingsService.changeUserPassword(testUser._id, 'oldPassword123', 'newPassword456');
    console.log('- Change password status result:', res.status);
    if (res.status !== 'success') {
      console.error('❌ Error: Password change was not successful!');
      process.exit(1);
    }

    // Verify password is changed
    const userWithPassword = await User.findById(testUser._id).select('+password');
    const isOldMatch = await userWithPassword.comparePassword('oldPassword123');
    const isNewMatch = await userWithPassword.comparePassword('newPassword456');

    console.log('- Compares old password:', isOldMatch);
    console.log('- Compares new password:', isNewMatch);

    if (isOldMatch || !isNewMatch) {
      console.error('❌ Error: Old password still works or new password failed to register!');
      process.exit(1);
    }
    console.log('✅ Password rotation verified successfully.');

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await CompanySettings.deleteMany({});
    await SystemPreferences.deleteMany({});
    await User.deleteMany({ email: testEmail });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL SETTINGS MODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
