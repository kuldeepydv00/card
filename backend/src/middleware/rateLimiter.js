const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000
});

const betLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000
});

module.exports = { globalLimiter, betLimiter };
