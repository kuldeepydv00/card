require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Setting = require('./src/models/Setting');
const bcrypt = require('bcrypt');
const logger = require('./src/utils/logger');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');

    // Seed Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12);
    
    // Find admin by email
    let targetAdmin = await User.findOne({ email: adminEmail });
    
    if (!targetAdmin) {
      // Check if username 'admin' exists. If so, create admin with a different username to avoid conflict.
      const existingUsername = await User.findOne({ username: 'admin' });
      const usernameToUse = existingUsername ? 'admin_new' : 'admin';
      
      const admin = new User({
        username: usernameToUse,
        email: adminEmail,
        password_hash: password_hash,
        role: 'admin',
        wallet_balance: 1000000
      });
      await admin.save();
      logger.info('Admin user created');
    } else {
      // User with this email exists, promote them to admin and update password
      targetAdmin.role = 'admin';
      targetAdmin.password_hash = password_hash;
      await targetAdmin.save();
      logger.info('Existing user promoted to admin and credentials updated successfully');
    }

    // Seed Settings
    const defaultSettings = [
      { key: 'min_bet', value: 10 },
      { key: 'max_bet', value: 10000 },
      { key: 'tie_breaker_rule', value: 'random' },
      { key: 'betting_close_minute', value: 50 },
      { key: 'override_window_minutes', value: 10 }
    ];

    for (const s of defaultSettings) {
      await Setting.findOneAndUpdate(
        { key: s.key },
        { value: s.value },
        { upsert: true }
      );
    }
    logger.info('Default settings seeded');

    // Create a demo user
    const demoEmail = 'user@example.com';
    const existingDemo = await User.findOne({ email: demoEmail });
    if (!existingDemo) {
      const demo_hash = await bcrypt.hash('User@123', 12);
      const user = new User({
        username: 'demo_user',
        email: demoEmail,
        password_hash: demo_hash,
        role: 'user',
        wallet_balance: 5000
      });
      await user.save();
      logger.info('Demo user created');
    }

    logger.info('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
