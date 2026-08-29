import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import spaceRoutes from "./routes/spaceRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const allowedOrigins = [
  "http://localhost:5173",
  "https://study-space-bay-iota.vercel.app" 
];

app.use(cors({ origin: allowedOrigins, credentials: true }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`⚡ Connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔌 Disconnected: ${socket.id}`);
  });
});

app.use("/api/spaces", spaceRoutes);
app.use("/api/students", studentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
