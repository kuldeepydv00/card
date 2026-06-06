const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: 100 
  }, // minimum withdrawal amount
  account_details: {
    upi_id: String,
    bank_account: { 
      account_number: String, 
      ifsc: String, 
      beneficiary_name: String 
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'processed'], 
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

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
