const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/cardgame')
  .then(async () => {
    const users = await User.find({ 
      $or: [
        { username: /kuldeep/i },
        { email: /kuldeep/i }
      ]
    });
    console.log(`Found ${users.length} users matching 'kuldeep':`);
    users.forEach(u => {
      console.log(`ID: ${u._id}, Username: ${u.username}, Email: ${u.email}, Wallet: ${u.wallet_balance}, Role: ${u.role}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
