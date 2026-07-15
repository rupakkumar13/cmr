import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Customer from '../../crm/customer/models/Customer.js';
import Product from '../../inventory/models/Product.js';
import Invoice from '../../billing/invoice/models/Invoice.js';
import ReportsService from '../services/reports.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Reports Module Aggregation Verification Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    // 0. Clean up previous test seed records
    console.log('\n🌱 Cleaning up and seeding mock dataset...');
    await Customer.deleteMany({ customerCode: 'CUST-REP-TEST' });
    await Product.deleteMany({ productCode: 'PROD-REP-TEST' });
    await Invoice.deleteMany({ invoiceNumber: 'INV-REP-TEST' });

    const fakeSalesPersonId = new mongoose.Types.ObjectId();
    const fakeCreatorId = new mongoose.Types.ObjectId();

    const customer = await Customer.create({
      customerCode: 'CUST-REP-TEST',
      companyName: 'Wayne Enterprises',
      customerName: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Wayne Customer');

    const product = await Product.create({
      productCode: 'PROD-REP-TEST',
      name: 'Grappling Hook Launchers',
      sku: 'GRAP-REP-TEST',
      categoryId: new mongoose.Types.ObjectId(),
      purchasePrice: 100,
      sellingPrice: 150,
      currentStock: 25,
      minimumStock: 5,
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Product');

    const invoice = await Invoice.create({
      invoiceNumber: 'INV-REP-TEST',
      dealId: new mongoose.Types.ObjectId(),
      customerId: customer._id,
      salesPersonId: fakeSalesPersonId,
      products: [
        {
          productId: product._id,
          quantity: 2,
          unitPrice: 150,
          subtotal: 300,
          total: 300
        }
      ],
      subtotal: 300,
      grandTotal: 300,
      amountPaid: 300,
      remainingAmount: 0,
      paymentStatus: 'PAID',
      invoiceStatus: 'SENT',
      invoiceDate: new Date(),
      dueDate: new Date(),
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Paid Invoice');

    // 1. Run Sales reports with text search filter matching Wayne
    console.log('\n📊 Testing Sales Reports fetching...');
    const salesReport = await ReportsService.getSalesReport({
      search: 'INV-REP-TEST',
      limit: 10
    });
    console.log('- Total sales reports found matching search:', salesReport.total);
    console.log('- Grand total summary of matching invoice sales:', salesReport.summary.totalSales);

    if (salesReport.total !== 1) {
      console.error('❌ Error: Expected exactly 1 invoice matched!');
      process.exit(1);
    }
    if (salesReport.summary.totalSales !== 300) {
      console.error('❌ Error: Expected grandTotal sum to equal 300!');
      process.exit(1);
    }
    console.log('✅ Sales report aggregates matches Wayne records successfully.');

    // 2. Run Inventory reports filter SKU
    console.log('\n📦 Testing Inventory Reports fetching...');
    const inventoryReport = await ReportsService.getInventoryReport({
      search: 'GRAP-REP-TEST',
      limit: 10
    });
    console.log('- Products matching SKU index count:', inventoryReport.total);
    if (inventoryReport.total !== 1) {
      console.error('❌ Error: Expected exactly 1 product matched!');
      process.exit(1);
    }
    console.log('✅ Inventory report search matched successfully.');

    // 3. Clean up
    console.log('\n🧹 Cleaning up test database profiles...');
    await Customer.deleteOne({ _id: customer._id });
    await Product.deleteOne({ _id: product._id });
    await Invoice.deleteOne({ _id: invoice._id });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL REPORTS MODULE INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
