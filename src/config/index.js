require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/husna_app',
  jwtSecret: process.env.JWT_SECRET || 'husna_jwt_secret',
};