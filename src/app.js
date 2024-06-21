// Description: Main application file. This file is responsible for starting the server, connecting to the database, and setting up middleware and routes.
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

// Config
const config = require('./config');

// Database
const connectDB = require('./config/database');

// Middleware
const errorHandler = require('./middleware/errorHandler');

// Routes
const routes = require('./routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const eventRoutes = require('./routes/event.routes');
const searchRoutes = require('./routes/search.routes');
const institutionRoutes = require('./routes/institution.routes');
const instructorRoutes = require('./routes/instructor.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const notificationRoutes = require('./routes/notification.routes');
const reviewRoutes = require('./routes/review.routes');
const paymentRoutes = require('./routes/payment.routes');

// Initialize express app
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Husna App API. Use /api for API routes.' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Husna server running on port ${config.port} in ${config.nodeEnv} mode`);
});



module.exports = app;