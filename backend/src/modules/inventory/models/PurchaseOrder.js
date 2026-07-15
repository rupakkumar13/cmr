import mongoose from 'mongoose';

const purchaseOrderProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  purchaseOrderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true,
  },
  products: [purchaseOrderProductSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['UNPAID', 'PAID', 'PARTIALLY_PAID'],
    default: 'UNPAID',
    index: true,
  },
  orderStatus: {
    type: String,
    enum: ['PENDING', 'RECEIVED', 'CANCELLED'],
    default: 'PENDING',
    index: true,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  }
}, {
  timestamps: true
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

export default PurchaseOrder;
