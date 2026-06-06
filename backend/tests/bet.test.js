const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Setting = require('../src/models/Setting');
const jwt = require('jsonwebtoken');

describe('Bet Placement API', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Create test user
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password_hash: 'hash',
      wallet_balance: 1000
    });
    await user.save();
    userId = user._id;

    token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    // Ensure settings
    await Setting.findOneAndUpdate({ key: 'betting_close_minute' }, { value: 59 }, { upsert: true });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  test('POST /api/bet/place - should place bet successfully', async () => {
    const res = await request(app)
      .post('/api/bet/place')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cardCode: 'AH',
        betAmount: 100
      });

    expect(res.status).toBe(201);
    expect(res.body.card_code).toBe('AH');
    expect(res.body.bet_amount).toBe(100);

    const updatedUser = await User.findById(userId);
    expect(updatedUser.wallet_balance).toBe(900);
  });

  test('POST /api/bet/place - should fail with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/bet/place')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cardCode: 'KS',
        betAmount: 2000
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Insufficient balance or user not found');
  });
});
