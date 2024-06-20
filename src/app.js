const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const config = require('./config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const routes = require('./routes');
const userRoutes = require('./routes/user.routes');
const groupRoutes = require('./routes/group.routes');
const eventRoutes = require('./routes/event.routes');



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