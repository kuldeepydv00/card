const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'bet_placed', 'winning'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  }, // positive for credit, negative for debit
  wallet_balance_after: { 
    type: Number, 
    required: true 
  },
  reference_id: { 
    type: String 
  }, // bet_id, withdrawal_id, payment_txn_id
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'success' 
  },
  description: { 
    type: String 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

transactionSchema.index({ user_id: 1, created_at: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
