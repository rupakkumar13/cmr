import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../../auth/models/User.js';
import Customer from '../models/Customer.js';
import Counter from '../models/Counter.js';
import CustomerService from '../services/customer.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting CRM Customer Management Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail = 'test_sales_person@example.com';
    
    // 0. Cleanup previous test run data
    const oldSales = await User.findOne({ email: testEmail });
    if (oldSales) {
      await Customer.deleteMany({ createdBy: oldSales._id });
      await User.deleteOne({ _id: oldSales._id });
    }
    
    // Reset Counter specifically for customerCode test predictability
    await Counter.deleteOne({ id: 'customerCode' });
    console.log('🧹 Cleaned up old customer test data.');

    // 1. Create a Test Sales/Admin User
    console.log('\n📝 Creating Test User Account...');
    const salesUser = await User.create({
      name: 'Sales Manager Rep',
      email: testEmail,
      password: 'testPassword123',
      role: 'SALES',
      isVerified: true
    });
    console.log('✅ Test user registered.');

    // 2. Test Customer Registration (Sequential codes check)
    console.log('\n👤 Registering First Customer (CUST-0001)...');
    const customer1 = await CustomerService.createCustomer({
      companyName: 'Acme Corporates Inc.',
      customerName: 'Wile E. Coyote',
      email: 'wile@acme.com',
      phone: '555-0199',
      industry: 'Manufacturing',
      assignedSalesPerson: salesUser._id,
      status: 'ACTIVE',
      billingAddress: {
        street: '100 Desert Highway',
        city: 'Phoenix',
        state: 'AZ',
        country: 'US',
        zipCode: '85001'
      }
    }, salesUser._id);
    
    console.log('✅ Customer 1 registered. Code generated:', customer1.customerCode);
    if (customer1.customerCode !== 'CUST-0001') {
      console.error('❌ Error: First customer code should be CUST-0001, got:', customer1.customerCode);
      process.exit(1);
    }

    console.log('\n👤 Registering Second Customer (CUST-0002)...');
    const customer2 = await CustomerService.createCustomer({
      companyName: 'Stark Enterprises',
      customerName: 'Tony Stark',
      email: 'tony@stark.com',
      phone: '555-3000',
      industry: 'Technology',
      assignedSalesPerson: salesUser._id,
      status: 'ACTIVE'
    }, salesUser._id);
    
    console.log('✅ Customer 2 registered. Code generated:', customer2.customerCode);
    if (customer2.customerCode !== 'CUST-0002') {
      console.error('❌ Error: Second customer code should be CUST-0002, got:', customer2.customerCode);
      process.exit(1);
    }

    // 3. Test List and Pagination
    console.log('\n📋 Querying Customer list (Pagination & Sort)...');
    const queryResult1 = await CustomerService.queryCustomers({
      page: 1,
      limit: 1,
      sortBy: 'customerCode',
      sortOrder: 'asc'
    });
    console.log('✅ Query results:');
    console.log('Total customers found:', queryResult1.totalCustomers);
    console.log('Returned count:', queryResult1.customers.length);
    console.log('First customer name in sorted list:', queryResult1.customers[0].customerName);
    
    if (queryResult1.totalCustomers !== 2 || queryResult1.customers.length !== 1 || queryResult1.customers[0].customerCode !== 'CUST-0001') {
      console.error('❌ Error: Pagination sorting/limits failed!');
      process.exit(1);
    }

    // 4. Test Search Matching
    console.log('\n🔍 Testing search matching ("tony")...');
    const searchResult = await CustomerService.queryCustomers({
      search: 'tony'
    });
    console.log('✅ Search matches found:', searchResult.customers.length);
    if (searchResult.customers.length !== 1 || searchResult.customers[0].customerName !== 'Tony Stark') {
      console.error('❌ Error: Text RegExp searching failed!');
      process.exit(1);
    }

    // 5. Test Update details
    console.log('\n🔄 Testing Customer Profile updates...');
    const updated = await CustomerService.updateCustomer(customer1._id, {
      customerName: 'Wile E. Coyote SuperGenius',
      phone: '555-0200'
    });
    console.log('✅ Customer updated. Name:', updated.customerName, 'Phone:', updated.phone);
    if (updated.customerName !== 'Wile E. Coyote SuperGenius') {
      console.error('❌ Error: Customer update failed!');
      process.exit(1);
    }

    // 6. Test Soft Delete
    console.log('\n🗑️ Testing Soft-Delete protection...');
    await CustomerService.softDeleteCustomer(customer1._id);
    console.log('✅ Soft-deleted Customer 1.');

    // Attempting to fetch CUST-0001 via ID should fail/throw 404
    try {
      await CustomerService.getCustomerById(customer1._id);
      console.error('❌ Error: Allowed retrieval of soft-deleted Customer!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Correctly blocked details lookup for soft-deleted customer:', err.message);
    }

    // Listing active customers should exclude CUST-0001
    const finalQuery = await CustomerService.queryCustomers({});
    console.log('✅ Remaining active customers listing count:', finalQuery.customers.length);
    if (finalQuery.customers.length !== 1 || finalQuery.customers[0].customerCode !== 'CUST-0002') {
      console.error('❌ Error: Omit soft-deleted filtering failed!');
      process.exit(1);
    }

    // 7. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await Customer.deleteMany({ createdBy: salesUser._id });
    await Counter.deleteOne({ id: 'customerCode' });
    await User.deleteOne({ _id: salesUser._id });
    console.log('✅ Database cleaned up.');
    console.log('\n🎉 ALL CUSTOMER SUBMODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration test run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
