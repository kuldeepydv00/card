const { Server } = require('socket.io');
const logger = require('../utils/logger');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'https://50xcards.in',
        'https://www.50xcards.in',
        'https://card-rho-livid.vercel.app',
        process.env.CLIENT_URL,
        'http://localhost:5173'
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
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
