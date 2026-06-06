require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { initCronJobs } = require('./services/cronJobs');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Connect to Database
connectDB().then(() => {
  // Initialize Cron Jobs
  initCronJobs();

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
