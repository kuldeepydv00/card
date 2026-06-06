const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  hour_slot: { 
    type: Date, 
    required: true, 
    index: true 
  }, // e.g. 2025-05-03T14:00:00.000Z
  card_code: { 
    type: String, 
    required: true, 
    uppercase: true, 
    match: /^([2-9]|10|[JQKA])([HDCS])$/ 
  },
  bet_amount: { 
    type: Number, 
    required: true 
  },
  win_amount: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  status: { 
    type: String, 
    enum: ['pending', 'settled'], 
    default: 'pending', 
    index: true 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for efficient result processing
betSchema.index({ hour_slot: 1, status: 1 });

module.exports = mongoose.model('Bet', betSchema);
