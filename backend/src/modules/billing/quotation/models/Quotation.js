import mongoose from 'mongoose';

const quotationProductSchema = new mongoose.Schema({
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

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer reference is required'],
    index: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Company reference is required'],
    index: true,
  },
  dealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: [true, 'Deal reference is required'],
    index: true,
  },
  salesPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Salesperson reference is required'],
    index: true,
  },
  salespersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true,
    default: null
  },
  products: [quotationProductSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    required: true,
    default: 0
  },
  shippingCharge: {
    type: Number,
    required: true,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  termsAndConditions: {
    type: String,
    trim: true,
  },
  quotationStatus: {
    type: String,
    enum: ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'DRAFT',
    index: true,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
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

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;
