const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  fees: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
    index: true,
  },
  bio: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  profilePhoto: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  workingHours: {
    days: [String],
    startTime: String,
    endTime: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationRequestedAt: {
    type: Date,
  },
});

const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;
