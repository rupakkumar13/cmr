import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User link is required'],
    unique: true,
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null,
  },
  designation: {
    type: String,
    required: [true, 'Designation is required'],
    trim: true,
  },
  dateOfJoining: {
    type: Date,
    required: [true, 'Date of joining is required'],
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    default: 'ACTIVE',
  },
  personalInfo: {
    dob: Date,
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    phoneNumber: String,
    address: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    }
  },
  documents: [{
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }]
}, {
  timestamps: true
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;
