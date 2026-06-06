const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'development' ? true : process.env.CLIENT_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId);
      logger.info(`User ${userId} connected to socket`);
    }

    socket.on('disconnect', () => {
      logger.info('Socket disconnected');
    });
  });

  return io;
};

const getIo = () => io;

module.exports = { initSocket, getIo };
