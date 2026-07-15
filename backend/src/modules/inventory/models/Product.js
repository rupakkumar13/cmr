import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
    index: true,
  },
  description: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  unit: {
    type: String,
    default: 'units',
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: 0,
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  minimumStock: {
    type: Number,
    default: 5,
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock levels cannot drop below zero'],
  },
  warehouseLocation: {
    type: String,
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    index: true,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE',
    index: true,
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

const Product = mongoose.model('Product', productSchema);

export default Product;
