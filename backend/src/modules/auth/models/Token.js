import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  }
}, {
  timestamps: true
});

// Configure MongoDB TTL (Time To Live) index to auto-delete documents when expiresAt is reached
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);

export default Token;
