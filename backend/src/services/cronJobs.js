const cron = require('node-cron');
const { processHourlyResult } = require('./resultProcessor');
const logger = require('../utils/logger');
const { getIo } = require('../config/socket');
const { getPreviousSlot } = require('../utils/timeUtils');

const initCronJobs = () => {
  // Every hour at :30 UTC (which is :00 in IST)
  cron.schedule('30 * * * *', async () => {
    logger.info('Running hourly result processor cron...');
    try {
      const Setting = require('../models/Setting');
      const gameModeSetting = await Setting.findOne({ key: 'game_mode' });
      const gameMode = gameModeSetting?.value || 'auto';

      if (gameMode === 'manual') {
        logger.info('Game mode is MANUAL. Skipping automatic declaration. Waiting for admin...');
        return;
      }

      const previousHour = getPreviousSlot(new Date());
      
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

  // Fallback Cron at :40 UTC (which is :10 in IST) for manual mode
  cron.schedule('40 * * * *', async () => {
    logger.info('Running manual mode fallback check...');
    try {
      const Setting = require('../models/Setting');
      const gameModeSetting = await Setting.findOne({ key: 'game_mode' });
      const gameMode = gameModeSetting?.value || 'auto';

      if (gameMode !== 'manual') return;

      const previousHour = getPreviousSlot(new Date());
      
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
