const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

// TODO: Implement user controller
// const userController = require('../controllers/user.controller');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);


router.get('/events', (req, res) => {
  // TODO: Implement get user events
  res.status(501).json({ message: 'Get user events not implemented yet' });
});

router.get('/groups', (req, res) => {
  // TODO: Implement get user groups (classes and circles)
  res.status(501).json({ message: 'Get user groups not implemented yet' });
});

module.exports = router;