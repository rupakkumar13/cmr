import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../auth/models/User.js';
import Customer from '../customer/models/Customer.js';
import Lead from '../lead/models/Lead.js';
import Deal from '../deal/models/Deal.js';
import Meeting from '../meeting/models/Meeting.js';
import FollowUp from '../followup/models/FollowUp.js';
import ActivityLog from '../activity/models/ActivityLog.js';
import Counter from '../customer/models/Counter.js';

import CustomerService from '../customer/services/customer.service.js';
import LeadService from '../lead/services/lead.service.js';
import DealService from '../deal/services/deal.service.js';
import MeetingService from '../meeting/services/meeting.service.js';
import FollowUpService from '../followup/services/followUp.service.js';
import ActivityLogService from '../activity/services/activityLog.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Completed CRM Suite Unit & Integration Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail = 'test_crm_suite_sales@example.com';

    // 0. Cleanup previous test entries
    const oldUser = await User.findOne({ email: testEmail });
    if (oldUser) {
      await Lead.deleteMany({ createdBy: oldUser._id });
      await Customer.deleteMany({ createdBy: oldUser._id });
      await Deal.deleteMany({ createdBy: oldUser._id });
      await Meeting.deleteMany({ host: oldUser._id });
      await FollowUp.deleteMany({ createdBy: oldUser._id });
      await ActivityLog.deleteMany({ performedBy: oldUser._id });
      await User.deleteOne({ _id: oldUser._id });
    }

    // Reset counters specifically
    await Counter.deleteOne({ id: 'leadCode' });
    await Counter.deleteOne({ id: 'customerCode' });
    await Counter.deleteOne({ id: 'dealCode' });
    console.log('🧹 Cleaned up old test records.');

    // 1. Create User
    const salesUser = await User.create({
      name: 'CRM Admin Tester',
      email: testEmail,
      password: 'testPassword123',
      role: 'SALES',
      isVerified: true
    });
    console.log('✅ Test user registered.');

    // 2. Onboard Lead & Convert (Checking activity triggers)
    console.log('\n👤 Testing Lead onboarding and conversion log audit paths...');
    const lead = await LeadService.createLead({
      companyName: 'LuthorCorp',
      leadName: 'Lex Luthor',
      email: 'lex@luthorcorp.com',
      phone: '555-9000',
      source: 'Cold Call',
      assignedSalesPerson: salesUser._id
    }, salesUser._id);
    console.log('✅ Lead created:', lead.leadCode);

    const customer = await LeadService.convertLeadToCustomer(lead._id, salesUser._id);
    console.log('✅ Lead converted to Customer:', customer.customerCode);

    // 3. Create Deal
    console.log('\n💵 Testing Deal Management operations & code increments...');
    const deal = await DealService.createDeal({
      title: 'Kryptonite Research Deal',
      customer: customer._id,
      amount: 850000,
      stage: 'QUALIFICATION',
      assignedSalesPerson: salesUser._id
    }, salesUser._id);
    console.log('✅ Deal created:', deal.dealCode, 'Stage:', deal.stage);
    if (deal.dealCode !== 'DEAL-0001') {
      console.error('❌ Error: Expected code DEAL-0001, got:', deal.dealCode);
      process.exit(1);
    }

    // Update Deal stage (should write stage-change activity log)
    const updatedDeal = await DealService.updateDeal(deal._id, {
      stage: 'PROPOSAL'
    }, salesUser._id);
    console.log('✅ Deal updated. New Stage:', updatedDeal.stage);

    // 4. Create Meeting
    console.log('\n📅 Scheduling Meeting...');
    const meeting = await MeetingService.createMeeting({
      title: 'Discuss Lexcorp Acquisition parameters',
      customer: customer._id,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
      participants: ['lex@luthorcorp.com']
    }, salesUser._id);
    console.log('✅ Meeting scheduled:', meeting.title);

    // 5. Create Follow Up task
    console.log('\n📋 Scheduling Follow Up task...');
    const followup = await FollowUpService.createFollowUp({
      title: 'Send NDA agreements',
      customer: customer._id,
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      priority: 'HIGH',
      assignedTo: salesUser._id
    }, salesUser._id);
    console.log('✅ FollowUp task created:', followup.title);

    // 6. Verify Customer Activity logs timeline
    console.log('\n🔍 Auditing Activity Timeline for Customer Lex Luthor...');
    const logs = await ActivityLogService.getActivityLogsForEntity(customer._id);
    console.log('Total activities logged for Customer:', logs.length);
    logs.forEach((l, idx) => {
      console.log(`[Activity ${idx + 1}] Action: ${l.action} | Description: ${l.description}`);
    });

    if (logs.length < 4) {
      console.error('❌ Error: Missing expected timeline activities. Expected at least 4.');
      process.exit(1);
    }
    console.log('✅ Activity timeline logged successfully.');

    // 7. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await Lead.deleteMany({ createdBy: salesUser._id });
    await Customer.deleteMany({ createdBy: salesUser._id });
    await Deal.deleteMany({ createdBy: salesUser._id });
    await Meeting.deleteMany({ host: salesUser._id });
    await FollowUp.deleteMany({ createdBy: salesUser._id });
    await ActivityLog.deleteMany({ performedBy: salesUser._id });
    await Counter.deleteOne({ id: 'leadCode' });
    await Counter.deleteOne({ id: 'customerCode' });
    await Counter.deleteOne({ id: 'dealCode' });
    await User.deleteOne({ _id: salesUser._id });

    console.log('✅ Cleanup completed.');
    console.log('\n🎉 ALL CRM BACKEND SUB-MODULES PASSED INTEGRATION TESTS SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
