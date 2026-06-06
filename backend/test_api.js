const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/cardgame').then(async () => {
  const User = require('./src/models/User');
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.log('No admin found');
    process.exit(1);
  }
  
  const token = jwt.sign({ id: admin._id }, 'your_super_secret_jwt_key_change_me', { expiresIn: '1h' });
  console.log('Token:', token);
  
  const fetch = require('node-fetch'); // or use native fetch if Node 18+
  const res = await global.fetch('http://localhost:5001/api/admin/reports?period=daily', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.text();
  console.log('Reports API status:', res.status);
  console.log('Reports API response:', data);

  const res2 = await global.fetch('http://localhost:5001/api/admin/withdrawals', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data2 = await res2.text();
  console.log('Withdrawals API status:', res2.status);
  console.log('Withdrawals API length:', data2.length);

  process.exit(0);
}).catch(console.error);
