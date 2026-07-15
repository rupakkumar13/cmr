import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee link is required'],
  },
  date: {
    type: String, // format YYYY-MM-DD
    required: [true, 'Date is required'],
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in time is required'],
  },
  checkOut: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'],
  },
  workHours: {
    type: Number,
    default: 0, // Calculated in hours on check-out
  }
}, {
  timestamps: true
});

// Enforce unique check-in record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
