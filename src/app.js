// Description: Main application file. This file is responsible for starting the server, connecting to the database, and setting up middleware and routes.
require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const donationController = require('./controllers/donation.controller');

const port = process.env.PORT || 3000;
const helmet = require("helmet");

const onlineUsers = new Set();

// Config
const config = require("./config");

// Database
const connectDB = require("./config/database");



// Routes
const routes = require("./routes");
const userRoutes = require("./routes/user.routes");
const groupRoutes = require("./routes/group.routes");
const eventRoutes = require("./routes/event.routes");
const searchRoutes = require("./routes/search.routes");
const institutionRoutes = require("./routes/institution.routes");
const instructorRoutes = require("./routes/instructor.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const notificationRoutes = require("./routes/notification.routes");
const reviewRoutes = require("./routes/review.routes");
const paymentRoutes = require("./routes/payment.routes");
const donationRoutes = require('./routes/donation.routes');
const chatRoutes = require("./routes/chat.routes");
const prayerTimeRoutes = require('./routes/prayerTime.routes');
const twilioRoutes = require('./routes/twilio.routes');


// Initialize express app
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
const twilio = require('twilio');
const twilioClient = twilio(process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, { accountSid: process.env.TWILIO_ACCOUNT_SID });

// Webhook-specific middleware
app.use('/api/donations/webhook', express.raw({type: 'application/json'}));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/donations/webhook') {
    req.rawBody = req.body;
    console.log("Webhook request received");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Raw Body:", req.rawBody.toString());
  }
  next();
});
// Connect to Database
connectDB();

// Other middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).send('Something broke!');
  next();
});
const errorHandler = require("./middleware/errorHandler");
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use((req, res, next) => {
  if (req.originalUrl === '/api/donations/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/donations/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.rawBody) {
    console.log('Raw Body:', req.rawBody);
  } else if (req.body) {
    console.log('Body:', req.body);
  }
  next();
});


// Routes
app.use("/api", routes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/donations', donationRoutes);
app.use("/api/chat", chatRoutes);
app.use('/api/prayer-times', prayerTimeRoutes);
app.use('/api/twilio', twilioRoutes);
app.post('/api/twilio/voice', (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.say('Welcome to the group call');
  twiml.dial().conference('My conference');
  res.type('text/xml');
  res.send(twiml.toString());
});

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Husna App API. Use /api for API routes.",
  });
});

app.use(errorHandler);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Not Found" });
});



io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join-voip-room', (groupId) => {
    socket.join(`voip-${groupId}`);
  });

  socket.on('leave-voip-room', (groupId) => {
    socket.leave(`voip-${groupId}`);
  });

  socket.on('voip-signal', ({ groupId, signal, to }) => {
    io.to(`voip-${groupId}`).emit('voip-signal', { from: socket.id, signal, to });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
;
// app.set('trust proxy', true)

// Error handling
console.log('Environment variables:', {
  NODE_ENV: process.env.NODE_ENV,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set',
  // Add any other relevant variables
});
// Start server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
