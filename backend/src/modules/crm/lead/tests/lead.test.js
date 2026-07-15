import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../../auth/models/User.js';
import Lead from '../models/Lead.js';
import Customer from '../../customer/models/Customer.js';
import Counter from '../../customer/models/Counter.js';
import LeadService from '../services/lead.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting CRM Lead Management Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail = 'test_sales_lead@example.com';

    // 0. Cleanup previous test run data
    const oldSales = await User.findOne({ email: testEmail });
    if (oldSales) {
      await Lead.deleteMany({ createdBy: oldSales._id });
      await Customer.deleteMany({ createdBy: oldSales._id });
      await User.deleteOne({ _id: oldSales._id });
    }

    // Reset counters specifically for code generation predictability
    await Counter.deleteOne({ id: 'leadCode' });
    await Counter.deleteOne({ id: 'customerCode' });
    console.log('🧹 Cleaned up old lead test data.');

    // 1. Create a Test Sales/Admin User
    console.log('\n📝 Creating Test User Account...');
    const salesUser = await User.create({
      name: 'Sales Rep Lead Owner',
      email: testEmail,
      password: 'testPassword123',
      role: 'SALES',
      isVerified: true
    });
    console.log('✅ Test user registered.');

    // 2. Test Lead Creation (Sequential codes check)
    console.log('\n👤 Registering First Lead (LEAD-0001)...');
    const lead1 = await LeadService.createLead({
      companyName: 'Wayne Enterprises',
      leadName: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      phone: '555-0100',
      source: 'Referral',
      assignedSalesPerson: salesUser._id,
      status: 'NEW',
      notes: 'High potential VIP client.'
    }, salesUser._id);

    console.log('✅ Lead 1 registered. Code generated:', lead1.leadCode);
    if (lead1.leadCode !== 'LEAD-0001') {
      console.error('❌ Error: First lead code should be LEAD-0001, got:', lead1.leadCode);
      process.exit(1);
    }

    console.log('\n👤 Registering Second Lead (LEAD-0002)...');
    const lead2 = await LeadService.createLead({
      companyName: 'Oscorp Industries',
      leadName: 'Norman Osborn',
      email: 'norman@oscorp.com',
      phone: '555-0200',
      source: 'Cold Call',
      status: 'NEW'
    }, salesUser._id);

    console.log('✅ Lead 2 registered. Code generated:', lead2.leadCode);
    if (lead2.leadCode !== 'LEAD-0002') {
      console.error('❌ Error: Second lead code should be LEAD-0002, got:', lead2.leadCode);
      process.exit(1);
    }

    // 3. Test Query and Search matching
    console.log('\n🔍 Testing search matching ("bruce")...');
    const searchResult = await LeadService.queryLeads({
      search: 'bruce'
    });
    console.log('✅ Search matches found:', searchResult.leads.length);
    if (searchResult.leads.length !== 1 || searchResult.leads[0].leadName !== 'Bruce Wayne') {
      console.error('❌ Error: Lead searching failed!');
      process.exit(1);
    }

    // 4. Test Lead update
    console.log('\n🔄 Testing Lead updates...');
    const updated = await LeadService.updateLead(lead1._id, {
      status: 'CONTACTED',
      notes: 'VIP client - contacted via phone.'
    });
    console.log('✅ Lead updated. Status:', updated.status, 'Notes:', updated.notes);
    if (updated.status !== 'CONTACTED') {
      console.error('❌ Error: Lead update failed!');
      process.exit(1);
    }

    // 5. Test Conversion (Lead to Customer)
    console.log('\n🚀 Testing Lead-to-Customer conversion...');
    const customer = await LeadService.convertLeadToCustomer(lead1._id, salesUser._id);
    console.log('✅ Lead converted into Customer.');
    console.log('Generated Customer Code:', customer.customerCode);
    console.log('Generated Customer Name:', customer.customerName);
    console.log('Generated Customer Company:', customer.companyName);

    if (customer.customerCode !== 'CUST-0001' || customer.customerName !== 'Bruce Wayne') {
      console.error('❌ Error: Conversion mapping properties failed!');
      process.exit(1);
    }

    // Check Lead state after conversion
    const verifiedLead = await LeadService.getLeadById(lead1._id);
    console.log('Verified converted Lead status:', verifiedLead.status);
    console.log('Converted to customer boolean state:', verifiedLead.convertedToCustomer);
    
    if (verifiedLead.status !== 'QUALIFIED' || !verifiedLead.convertedToCustomer) {
      console.error('❌ Error: Lead state was not updated correctly after conversion!');
      process.exit(1);
    }

    // Check duplicate conversion block
    try {
      await LeadService.convertLeadToCustomer(lead1._id, salesUser._id);
      console.error('❌ Error: Allowed duplicate conversion of the same lead!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Correctly blocked duplicate conversion:', err.message);
    }

    // 6. Test Soft Delete
    console.log('\n🗑️ Testing Soft-Delete protection...');
    await LeadService.softDeleteLead(lead2._id);
    console.log('✅ Soft-deleted Lead 2.');

    try {
      await LeadService.getLeadById(lead2._id);
      console.error('❌ Error: Allowed details lookup of soft-deleted Lead!');
      process.exit(1);
    } catch (err) {
      console.log('✅ Correctly blocked lookup for soft-deleted lead:', err.message);
    }

    // 7. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await Lead.deleteMany({ createdBy: salesUser._id });
    await Customer.deleteMany({ createdBy: salesUser._id });
    await Counter.deleteOne({ id: 'leadCode' });
    await Counter.deleteOne({ id: 'customerCode' });
    await User.deleteOne({ _id: salesUser._id });
    console.log('✅ Database cleaned up.');
    console.log('\n🎉 ALL LEAD SUBMODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration test run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
