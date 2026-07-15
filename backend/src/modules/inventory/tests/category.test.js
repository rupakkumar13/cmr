import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../auth/models/User.js';
import Category from '../models/Category.js';
import Counter from '../models/Counter.js';
import CategoryService from '../services/category.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Inventory Category Module Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail = 'test_cat_manager@example.com';

    // 0. Cleanup previous test entries
    const oldUser = await User.findOne({ email: testEmail });
    if (oldUser) {
      await Category.deleteMany({ createdBy: oldUser._id });
      await User.deleteOne({ _id: oldUser._id });
    }
    await Counter.deleteOne({ id: 'categoryCode' });
    console.log('🧹 Cleaned up old test records.');

    // 1. Create User
    const managerUser = await User.create({
      name: 'Inventory Manager Tester',
      email: testEmail,
      password: 'testPassword123',
      role: 'MANAGER',
      isVerified: true
    });
    console.log('✅ Test user registered.');

    // 2. Onboard Category (Code auto generation test)
    console.log('\n📦 Testing Category Onboarding & Code Auto-Generation...');
    const cat1 = await CategoryService.createCategory({
      name: 'Electronics',
      description: 'Laptops, smartphones, and electrical devices'
    }, managerUser._id);
    console.log('✅ Created Category 1:', cat1.categoryCode, 'Name:', cat1.name);
    
    if (cat1.categoryCode !== 'CAT-0001') {
      console.error('❌ Error: Expected CAT-0001, got:', cat1.categoryCode);
      process.exit(1);
    }

    const cat2 = await CategoryService.createCategory({
      name: 'Office Supplies',
      description: 'Pens, papers, binders'
    }, managerUser._id);
    console.log('✅ Created Category 2:', cat2.categoryCode, 'Name:', cat2.name);

    if (cat2.categoryCode !== 'CAT-0002') {
      console.error('❌ Error: Expected CAT-0002, got:', cat2.categoryCode);
      process.exit(1);
    }

    // 3. Duplicate checks
    console.log('\n🚫 Testing unique name validation checks...');
    try {
      await CategoryService.createCategory({
        name: 'Electronics'
      }, managerUser._id);
      console.error('❌ Error: Allowed duplicate category name!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Correctly blocked duplicate category names:', err.message);
    }

    // 4. Parent category assignments and cycles
    console.log('\n🔗 Testing subcategory assignments & cycles...');
    const subCat = await CategoryService.createCategory({
      name: 'Smartphones',
      parentCategory: cat1._id
    }, managerUser._id);
    console.log('✅ Subcategory Smartphones created with parent Electronics');

    try {
      await CategoryService.updateCategory(subCat._id, {
        parentCategory: subCat._id
      });
      console.error('❌ Error: Allowed parent category self-assignment cycle!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Correctly blocked self-parent cycles:', err.message);
    }

    // 5. Update categories
    console.log('\n🔄 Testing category updates...');
    const updated = await CategoryService.updateCategory(cat2._id, {
      description: 'Updated Office Stationery and Supplies'
    });
    console.log('✅ Category 2 updated. Description:', updated.description);

    // 6. Subcategory deletion block
    console.log('\n🗑️ Testing child deletion guards...');
    try {
      await CategoryService.softDeleteCategory(cat1._id, managerUser._id);
      console.error('❌ Error: Allowed deleting parent category with active child!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Correctly blocked parent category deletion when subcategory is active:', err.message);
    }

    // 7. Success soft-delete
    console.log('\n🗑️ Testing clean soft-delete...');
    await CategoryService.softDeleteCategory(cat2._id, managerUser._id);
    console.log('✅ Category 2 soft-deleted successfully.');

    // 8. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await Category.deleteMany({ createdBy: managerUser._id });
    await Counter.deleteOne({ id: 'categoryCode' });
    await User.deleteOne({ _id: managerUser._id });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL CATEGORY MODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Test run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
