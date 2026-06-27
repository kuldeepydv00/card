const Notification = require('../models/Notification');
const { getIo } = require('../config/socket');
const logger = require('../utils/logger');

const createNotification = async (userId, title, message, type = 'system') => {
  try {
    const notification = new Notification({
      user_id: userId,
      title,
      message,
      type
    });

    await notification.save();

    const io = getIo();
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    logger.error(`Error creating notification for user ${userId}: ${error.message}`);
    return null;
  }
};

module.exports = {
  createNotification
};
