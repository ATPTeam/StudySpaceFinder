import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import spaceRoutes from './routes/spaceRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach io instance to express app
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

app.use('/api/spaces', spaceRoutes);
app.use('/api/students', studentRoutes);

// Test Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'StudySpace Finder API is live' });
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log(` Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(` Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});