const mongoose = require('mongoose');

const hourlyResultSchema = new mongoose.Schema({
  hour_slot: { 
    type: Date, 
    required: true, 
    unique: true, 
    index: true 
  },
  winning_card: { 
    type: String, 
    uppercase: true 
  },
  is_processed: { 
    type: Boolean, 
    default: false 
  },
  processed_at: { 
    type: Date 
  },
  declared_by: { 
    type: String, 
    enum: ['auto', 'admin_override'] 
  },
  admin_override_user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  total_bet_volume: { 
    type: Number, 
    default: 0 
  },
  lowest_bet_card_snapshot: {
    card: String,
    total_amount: Number,
    tied_cards: [String]
  },
  tie_breaker_used: { 
    type: String, 
    enum: ['random', 'rank_order'] 
  }
});

module.exports = mongoose.model('HourlyResult', hourlyResultSchema);
