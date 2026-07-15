import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../../../auth/models/User.js';
import Customer from '../../../crm/customer/models/Customer.js';
import Deal from '../../../crm/deal/models/Deal.js';
import Counter from '../../shared/models/Counter.js';
import Quotation from '../models/Quotation.js';
import QuotationService from '../services/quotation.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Billing Quotation Module Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    const testEmail = 'test_quote_salesperson@example.com';

    // 0. Cleanup previous test entries
    const oldUser = await User.findOne({ email: testEmail });
    if (oldUser) {
      await Quotation.deleteMany({ createdBy: oldUser._id });
      await Deal.deleteMany({ createdBy: oldUser._id });
      await Customer.deleteMany({ createdBy: oldUser._id });
      await User.deleteOne({ _id: oldUser._id });
    }
    console.log('🧹 Cleaned up old test records.');

    // 1. Create User
    const salesUser = await User.create({
      name: 'Sales Quotation Tester',
      email: testEmail,
      password: 'testPassword123',
      role: 'SALES',
      isVerified: true
    });
    console.log('✅ Sales rep registered.');

    // 2. Create customer
    const customer = await Customer.create({
      customerCode: 'CUST-TEMP-QUOTE',
      companyName: 'LuthorCorp Inc',
      customerName: 'Lex Luthor',
      email: 'lex@luthorcorp.com',
      createdBy: salesUser._id
    });
    console.log('✅ Customer created:', customer.customerName);

    // 2.5. Create Deal
    const deal = await Deal.create({
      dealCode: 'DEAL-TEMP-QUOTE',
      title: 'LuthorCorp Tower Deal',
      customer: customer._id,
      amount: 50000,
      stage: 'PROPOSAL',
      assignedSalesPerson: salesUser._id,
      createdBy: salesUser._id
    });
    console.log('✅ Deal created:', deal.title);

    // 3. Create Quotation & Verify auto code generation and pricing totals calculation
    console.log('\n📝 Testing Quotation Creation & Math calculations...');
    const fakeProduct1 = new mongoose.Types.ObjectId();
    const fakeProduct2 = new mongoose.Types.ObjectId();

    const quote1 = await QuotationService.createQuotation({
      customerId: customer._id,
      companyId: customer._id,
      dealId: deal._id,
      salesPersonId: salesUser._id,
      salespersonId: salesUser._id,
      products: [
        {
          productId: fakeProduct1,
          quantity: 2,
          unitPrice: 1500, // subtotal = 3000
          discount: 200,   // total = 2800
          tax: 150,        // total = 2950
        },
        {
          productId: fakeProduct2,
          quantity: 1,
          unitPrice: 500,  // subtotal = 500
          discount: 0,     // total = 500
          tax: 50,         // total = 550
        }
      ],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Initial quotation proposal for Lexcorp'
    }, salesUser._id);

    console.log('✅ Created Quotation 1:', quote1.quotationNumber);
    console.log('Math check:');
    console.log('- Expected Subtotal: 3500 | Got:', quote1.subtotal);
    console.log('- Expected Tax: 200 | Got:', quote1.tax);
    console.log('- Expected Discount: 200 | Got:', quote1.discount);
    console.log('- Expected Total Amount: 3500 | Got:', quote1.totalAmount); // 3000 - 200 + 150 + 500 - 0 + 50 = 3500

    if (!/^QT-\d+$/.test(quote1.quotationNumber)) {
      console.error('❌ Error: Invalid quotation number format, got:', quote1.quotationNumber);
      process.exit(1);
    }
    if (quote1.totalAmount !== 3500) {
      console.error('❌ Error: Total amount mismatch!');
      process.exit(1);
    }
    console.log('✅ Quotation math verified successfully.');

    // 4. Status update test
    console.log('\n🔄 Testing status update workflow...');
    const updated = await QuotationService.updateStatus(quote1._id, 'SENT');
    console.log('✅ Updated status successfully to:', updated.quotationStatus);

    // 5. Cleanup
    console.log('\n🧹 Cleaning up test database profiles...');
    await Quotation.deleteMany({ createdBy: salesUser._id });
    await Deal.deleteMany({ createdBy: salesUser._id });
    await Customer.deleteMany({ createdBy: salesUser._id });
    await User.deleteOne({ _id: salesUser._id });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL QUOTATION MODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
