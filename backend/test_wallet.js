const mongoose = require('mongoose');
const { updateBalance } = require('./src/services/walletService');

mongoose.connect('mongodb://localhost:27017/cardgame').then(async () => {
  const User = require('./src/models/User');
  let user = await User.findOne({ role: 'user' });
  
  if (!user) {
    user = new User({ username: 'testuser', email: 'test@example.com', password_hash: 'abc' });
    await user.save();
  }
  
  console.log('Balance before:', user.wallet_balance);
  
  await updateBalance(user._id, 500, 'deposit', 'admin_adj_1', 'Test admin adjust');
  
  const updatedUser = await User.findById(user._id);
  console.log('Balance after:', updatedUser.wallet_balance);
  
  process.exit(0);
}).catch(console.error);
