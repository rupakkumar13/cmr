import mongoose from 'mongoose';

const invoiceProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  name: {
    type: String,
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative'],
  },
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  }
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: [true, 'Deal reference is required'],
    index: true,
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    default: null,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer reference is required'],
    index: true,
  },
  salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Salesperson reference is required'],
    index: true,
  },
  products: [invoiceProductSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  discount: {
    type: Number,
    required: true,
    default: 0,
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingCharge: {
    type: Number,
    required: true,
    default: 0,
  },
  paymentTerms: {
    type: String,
    trim: true,
    default: '',
  },
  additionalDiscount: {
    type: Number,
    required: true,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
    default: 0,
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0,
  },
  remainingAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'],
    default: 'UNPAID',
    index: true,
  },
  invoiceStatus: {
    type: String,
    enum: ['DRAFT', 'SENT', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
