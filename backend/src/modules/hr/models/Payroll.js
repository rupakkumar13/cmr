import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee link is required'],
  },
  month: {
    type: Number,
    required: [true, 'Month (1-12) is required'],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
  },
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required'],
  },
  allowances: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: [true, 'Net salary is required'],
  },
  status: {
    type: String,
    enum: ['UNPAID', 'PAID'],
    default: 'UNPAID',
  },
  paymentDate: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

// Enforce unique payslip per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payroll = mongoose.model('Payroll', payrollSchema);

export default Payroll;
