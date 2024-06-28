// src/middleware/admin.js

const User = require('../models/User');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ message: "Error verifying admin status" });
  }
};

module.exports = adminAuthMiddleware;