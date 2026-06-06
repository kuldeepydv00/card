const mongoose = require('mongoose');
require('dotenv').config();

const { processHourlyResult } = require('./src/services/resultProcessor');

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  try {
    // try to process for current hour
    const d = new Date();
    d.setMinutes(0, 0, 0);
    const hourSlot = d.toISOString();
    
    console.log('Processing result for', hourSlot);
    const result = await processHourlyResult(hourSlot);
    console.log('Result:', result);
  } catch (e) {
    console.error('ERROR OCCURRED:', e);
  }
  
  process.exit(0);
};

test();
