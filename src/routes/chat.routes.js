const express = require('express');
const router = express.Router();

// TODO: Implement chat controller
// const chatController = require('../controllers/chat.controller');

router.get('/rooms', (req, res) => {
  // TODO: Implement get chat rooms
  res.status(501).json({ message: 'Get chat rooms not implemented yet' });
});

router.post('/rooms', (req, res) => {
  // TODO: Implement create chat room
  res.status(501).json({ message: 'Create chat room not implemented yet' });
});

router.get('/rooms/:id/messages', (req, res) => {
  // TODO: Implement get room messages
  res.status(501).json({ message: 'Get room messages not implemented yet' });
});

module.exports = router;