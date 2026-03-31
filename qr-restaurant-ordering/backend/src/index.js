import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());

// Increase JSON and URL-encoded payload size to handle base64 images
app.use(express.json({ limit: "5mb" }));        // allow up to 5MB JSON
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// ===============================
// HTTP SERVER (needed for Socket.io)
// ===============================
const server = http.createServer(app);

// ===============================
// SOCKET.IO SETUP
// ===============================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Make io accessible in routes
app.set("io", io);

// Connection event
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// ===============================
// ROUTES
// ===============================
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ===============================
// MONGODB CONNECTION
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.error("MongoDB Error ❌", err));

// ===============================
// START SERVER (IMPORTANT: use server.listen, NOT app.listen)
// ===============================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});