import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './utils/socket.js';

// Load environment variables
dotenv.config({ override: true });

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
