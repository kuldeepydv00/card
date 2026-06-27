const mongoose = require('mongoose');
const Bet = require('./src/models/Bet');
const HourlyResult = require('./src/models/HourlyResult');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const bets = await Bet.find().sort({ createdAt: -1 });
  console.log("Bets:", bets);
  
  const results = await HourlyResult.find().sort({ hour_slot: -1 });
  console.log("Results:", results);
  process.exit(0);
});
