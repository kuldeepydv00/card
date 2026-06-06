const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['BLOCK_USER', 'UNBLOCK_USER', 'ADJUST_WALLET', 'OVERRIDE_RESULT', 'APPROVE_WITHDRAWAL', 'REJECT_WITHDRAWAL', 'UPDATE_SETTINGS']
  },
  target_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  target_model: {
    type: String,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip_address: {
    type: String,
    required: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('AdminLog', adminLogSchema);
