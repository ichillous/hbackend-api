// src/app.js

require("dotenv").config();

const express = require("express");
const { connectToDatabase } = require("./config/database");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");  
const http = require("http");
const socketIo = require("socket.io");
const setupWebRTC = require("./utils/webrtc");

const port = process.env.PORT || 3000;
const routes = require("./routes"); 

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Setup WebRTC
setupWebRTC(io);

// Middleware
app.use(helmet());  
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes  
app.use("/api/auth", routes);

// Webhook-specific middleware 
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/webhook") {
    req.rawBody = req.body;
    console.log("Webhook request received");
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Raw Body:", req.rawBody.toString());
  }
  next();
});

// Error handling
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });  
});

// Start server  
connectToDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });

console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "Set" : "Not set", 
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "Set" : "Not set",
});

module.exports = app;