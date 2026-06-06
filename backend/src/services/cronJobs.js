const cron = require('node-cron');
const { processHourlyResult } = require('./resultProcessor');
const logger = require('../utils/logger');
const { getIo } = require('../config/socket');

const initCronJobs = () => {
  // Every hour at :00
  cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly result processor cron...');
    try {
      const Setting = require('../models/Setting');
      const gameModeSetting = await Setting.findOne({ key: 'game_mode' });
      const gameMode = gameModeSetting?.value || 'auto';

      if (gameMode === 'manual') {
        logger.info('Game mode is MANUAL. Skipping automatic declaration. Waiting for admin...');
        return;
      }

      const now = new Date();
      const previousHour = new Date(now);
      previousHour.setHours(previousHour.getHours() - 1, 0, 0, 0);
      
      const result = await processHourlyResult(previousHour);
      
      // Notify all users
      const io = getIo();
      if (io) {
        io.emit('result_declared', {
          hourSlot: previousHour,
          winningCard: result.winning_card
        });
        logger.info(`Emitted result_declared for ${previousHour}`);
      }
    } catch (error) {
      logger.error('Cron job failed:', error);
    }
  });

  // Fallback Cron at :10 for manual mode
  cron.schedule('10 * * * *', async () => {
    logger.info('Running manual mode fallback check...');
    try {
      const Setting = require('../models/Setting');
      const gameModeSetting = await Setting.findOne({ key: 'game_mode' });
      const gameMode = gameModeSetting?.value || 'auto';

      if (gameMode !== 'manual') return;

      const now = new Date();
      const previousHour = new Date(now);
      previousHour.setHours(previousHour.getHours() - 1, 0, 0, 0);
      
      const HourlyResult = require('../models/HourlyResult');
      const existingResult = await HourlyResult.findOne({ hour_slot: previousHour });
      
      if (!existingResult || !existingResult.is_processed) {
        logger.warn(`Admin forgot to declare result for ${previousHour}. AUTO-DECLARING fallback...`);
        const result = await processHourlyResult(previousHour);
        
        // Notify all users
        const io = getIo();
        if (io) {
          io.emit('result_declared', {
            hourSlot: previousHour,
            winningCard: result.winning_card
          });
          logger.info(`Emitted fallback result_declared for ${previousHour}`);
        }
      }
    } catch (error) {
      logger.error('Fallback cron failed:', error);
    }
  });

  // Daily cleanup at midnight (optional)
  cron.schedule('0 0 * * *', async () => {
    logger.info('Running daily cleanup cron...');
    // Add cleanup logic here if needed
  });
};

module.exports = { initCronJobs };
