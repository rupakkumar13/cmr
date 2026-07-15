import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'Invoice reference is required'],
    index: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer reference is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0.01, 'Amount must be greater than zero'],
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cheque', 'Wallet'],
    required: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  referenceNumber: {
    type: String,
    trim: true,
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'COMPLETED',
    index: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
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
  }
}, {
  timestamps: true
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
