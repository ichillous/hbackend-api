const User = require('../models/User');

const institutionAuthMiddleware = async (req, res, next) => {
  try {
    // Assuming the user object is attached to the request by the previous authMiddleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'institution' || !user.isVerified) {
      return res.status(403).json({ message: 'Access denied. Only verified institutions can perform this action.' });
    }

    // If the user is a verified institution, attach the institution ID to the request
    req.institutionId = user.id;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error authenticating institution', error: error.message });
  }
};

module.exports = institutionAuthMiddleware;