const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

async function isInstructor(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Only instructors can perform this action.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  authMiddleware,
  isInstructor
};