const mongoose = require('mongoose');
require('dotenv').config();
const Setting = require('./src/models/Setting');

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const settings = await Setting.find();
  console.log('Settings:', settings);
  process.exit(0);
};

test();
