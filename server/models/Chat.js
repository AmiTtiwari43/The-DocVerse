const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  specialization: { // For AI responses recommending specific doctors
    type: String, 
  },
  relatedDoctors: [{ // For AI responses listing specific doctors
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  tips: {
     food: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', chatSchema);
