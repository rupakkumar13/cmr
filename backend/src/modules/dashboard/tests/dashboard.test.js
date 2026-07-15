import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Employee from '../../hr/models/Employee.js';
import Customer from '../../crm/customer/models/Customer.js';
import Product from '../../inventory/models/Product.js';
import Invoice from '../../billing/invoice/models/Invoice.js';
import DashboardService from '../services/dashboard.service.js';

dotenv.config();

const test = async () => {
  console.log('🧪 Starting Dashboard Module Aggregation Pipeline Tests...');

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crm_monolith';
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');

  try {
    // 0. Seed basic records
    console.log('\n🌱 Cleaning up and seeding temporary mock records...');
    await Employee.deleteMany({ employeeId: 'EMP-DASH-TEST' });
    await Customer.deleteMany({ customerCode: 'CUST-DASH-TEST' });
    await Product.deleteMany({ productCode: 'PROD-DASH-TEST' });
    await Invoice.deleteMany({ invoiceNumber: 'INV-DASH-TEST' });

    const fakeSalesPersonId = new mongoose.Types.ObjectId();
    const fakeCreatorId = new mongoose.Types.ObjectId();

    const employee = await Employee.create({
      employeeId: 'EMP-DASH-TEST',
      name: 'Dashboard Tester',
      email: 'dashtester@example.com',
      position: 'Quality Assurance',
      designation: 'QA Tester',
      dateOfJoining: new Date(),
      user: fakeCreatorId,
      departmentId: new mongoose.Types.ObjectId(),
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Employee');

    const customer = await Customer.create({
      customerCode: 'CUST-DASH-TEST',
      companyName: 'LuthorCorp Inc',
      customerName: 'Lex Luthor',
      email: 'lex@luthorcorp.com',
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Customer');

    const product = await Product.create({
      productCode: 'PROD-DASH-TEST',
      name: 'Cryptocurrency Tokens',
      sku: 'CRYP-DASH-TEST',
      categoryId: new mongoose.Types.ObjectId(),
      purchasePrice: 10,
      sellingPrice: 15,
      currentStock: 3, // < minimumStock (5)
      minimumStock: 5,
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Low Stock Product');

    const invoice = await Invoice.create({
      invoiceNumber: 'INV-DASH-TEST',
      customerId: customer._id,
      salesPersonId: fakeSalesPersonId,
      products: [
        {
          productId: product._id,
          quantity: 2,
          unitPrice: 15,
          subtotal: 30,
          total: 30
        }
      ],
      subtotal: 30,
      grandTotal: 30,
      amountPaid: 30,
      remainingAmount: 0,
      paymentStatus: 'PAID',
      invoiceStatus: 'SENT',
      dueDate: new Date(),
      createdBy: fakeCreatorId
    });
    console.log('✅ Seeded Paid Invoice');

    // 1. Run Aggregations
    console.log('\n📊 Running Dashboard Aggregation Pipelines...');
    const summary = await DashboardService.getSummary();
    console.log('Summary metrics compiled:');
    console.log('- Total Employees:', summary.hr.totalEmployees);
    console.log('- Total Customers:', summary.crm.totalCustomers);
    console.log('- Low Stock Products:', summary.inventory.lowStockProducts);
    console.log('- Monthly Revenue:', summary.billing.revenueMonth);
    console.log('- Paid Invoices:', summary.billing.paidInvoices);

    if (summary.hr.totalEmployees < 1) {
      console.error('❌ Error: Expected employees count >= 1');
      process.exit(1);
    }
    if (summary.inventory.lowStockProducts < 1) {
      console.error('❌ Error: Expected low stock products count >= 1');
      process.exit(1);
    }
    if (summary.billing.revenueMonth < 30) {
      console.error('❌ Error: Expected monthly revenue >= 30, got:', summary.billing.revenueMonth);
      process.exit(1);
    }
    console.log('✅ Dashboard card metrics summary verified successfully.');

    // 2. Charts Data
    const charts = await DashboardService.getCharts();
    console.log('\n📈 Charts metrics compiled:');
    console.log('- Billing chart records:', charts.billingChartData.length);
    console.log('- Customer growth records:', charts.customerChartData.length);

    // 3. Clean up
    console.log('\n🧹 Cleaning up test database profiles...');
    await Employee.deleteOne({ _id: employee._id });
    await Customer.deleteOne({ _id: customer._id });
    await Product.deleteOne({ _id: product._id });
    await Invoice.deleteOne({ _id: invoice._id });
    console.log('✅ Cleanup completed.');

    console.log('\n🎉 ALL DASHBOARD AGGREGATION PIPELINES PASSED TESTS SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('❌ Integration tests run failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

test();
