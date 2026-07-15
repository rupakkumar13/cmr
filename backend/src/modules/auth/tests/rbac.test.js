import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting RBAC Role Configuration Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail1 = 'inventory_manager_test@example.com';
    const testEmail2 = 'accountant_test@example.com';

    // 0. Clean up
    await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
    console.log('🧹 Cleaned up old test user configurations');

    // 1. Create an Inventory Manager user
    console.log('\n📝 Testing registration of INVENTORY_MANAGER role...');
    const managerUser = await User.create({
      name: 'Stock Manager Bob',
      email: testEmail1,
      password: 'password123',
      role: 'INVENTORY_MANAGER',
      isVerified: true
    });
    console.log('✅ Created user with role:', managerUser.role);

    // 2. Create an Accountant user
    console.log('\n📝 Testing registration of ACCOUNTANT role...');
    const accountantUser = await User.create({
      name: 'Accountant Alice',
      email: testEmail2,
      password: 'password123',
      role: 'ACCOUNTANT',
      isVerified: true
    });
    console.log('✅ Created user with role:', accountantUser.role);

    // 3. Verify roles match the schema configurations
    const u1 = await User.findOne({ email: testEmail1 });
    const u2 = await User.findOne({ email: testEmail2 });

    console.log('\n🔍 Verifying stored role enums...');
    console.log('- User 1 role is INVENTORY_MANAGER:', u1.role === 'INVENTORY_MANAGER');
    console.log('- User 2 role is ACCOUNTANT:', u2.role === 'ACCOUNTANT');

    if (u1.role !== 'INVENTORY_MANAGER' || u2.role !== 'ACCOUNTANT') {
      console.error('❌ Error: Stored roles did not match expectations!');
      process.exit(1);
    }
    console.log('✅ Role configurations match schema perfectly.');

    // 4. Cleanup
    console.log('\n🧹 Cleaning up test accounts...');
    await User.deleteMany({ email: { $in: [testEmail1, testEmail2] } });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL RBAC ROLE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
