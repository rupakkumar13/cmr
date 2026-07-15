import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join room based on user role or ID
    socket.on('join', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
