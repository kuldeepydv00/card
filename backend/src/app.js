const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { globalLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'development' ? true : process.env.CLIENT_URL,
  credentials: true
}));
app.use(morgan('dev'));
app.use(globalLimiter);

// Special case for webhook (raw body might be needed for signature, but express.json() is usually fine for Razorpay)
app.use('/api/webhook', webhookRoutes);

// General JSON body parser
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
