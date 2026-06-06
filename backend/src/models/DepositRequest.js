const mongoose = require('mongoose');

const depositRequestSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 10
  },
  utr_number: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  admin_remarks: {
    type: String
  },
  requested_at: {
    type: Date,
    default: Date.now
  },
  processed_at: {
    type: Date
  }
});

module.exports = mongoose.model('DepositRequest', depositRequestSchema);
