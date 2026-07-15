import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model('InventoryCounter', counterSchema);

export default Counter;
