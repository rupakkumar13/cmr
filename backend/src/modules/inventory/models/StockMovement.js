import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  movementType: {
    type: String,
    enum: ['IN', 'OUT', 'RETURN', 'TRANSFER', 'ADJUSTMENT'],
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  reason: {
    type: String,
    trim: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  reference: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
