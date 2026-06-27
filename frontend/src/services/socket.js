import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000');

let socket;

export const initSocket = (userId) => {
  if (socket) socket.disconnect();
  
  socket = io(socketUrl, {
    query: { userId }
  });

  return socket;
};

export const getSocket = () => socket;
