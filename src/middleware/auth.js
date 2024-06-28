// src/middleware/auth.js
const admin = require('../config/firebase-admin');
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const isInstructor = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'instructor' || !req.user.isVerified) {
    return res.status(403).json({
      message: "Access denied. Only verified instructors can perform this action.",
    });
  }

  next();
};

const isInstitution = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'institution' || !req.user.isVerified) {
    return res.status(403).json({
      message: "Access denied. Only verified institutions can perform this action.",
    });
  }

  next();
};

const isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  next();
};

module.exports = {
  authMiddleware,
  isInstructor,
  isInstitution,
  isAdmin
};