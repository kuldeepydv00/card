const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  gateway_txn_id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    default: 'INR' 
  },
  status: { 
    type: String, 
    enum: ['created', 'success', 'failed'], 
    default: 'created' 
  },
  razorpay_order_id: { 
    type: String 
  },
  razorpay_payment_id: { 
    type: String 
  },
  processed: { 
    type: Boolean, 
    default: false 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
