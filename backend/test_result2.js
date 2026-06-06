const mongoose = require('mongoose');
require('dotenv').config();

const { processHourlyResult } = require('./src/services/resultProcessor');
const Bet = require('./src/models/Bet');
const User = require('./src/models/User');

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  try {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    const hourSlot = d.toISOString();
    
    // Check for user
    const user = await User.findOne();
    if (!user) {
        console.log("No user found");
        process.exit(1);
    }

    // Insert dummy bet
    await Bet.create({
        user_id: user._id,
        card_code: 'AH',
        bet_amount: 500,
        hour_slot: hourSlot,
        status: 'pending'
    });
    
    console.log('Processing result for', hourSlot);
    const result = await processHourlyResult(hourSlot);
    console.log('Result:', result);
  } catch (e) {
    console.error('ERROR OCCURRED:', e);
  }
  
  process.exit(0);
};

test();
