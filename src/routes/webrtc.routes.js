// src/routes/webrtc.routes.js

const express = require('express');
const router = express.Router();
const { createRoom, joinRoom, leaveRoom } = require('../controllers/webrtc.controller');
const { authMiddleware } = require('../middleware/auth');

router.post('/rooms', authMiddleware, createRoom);
router.post('/rooms/:roomId/join', authMiddleware, joinRoom);
router.post('/rooms/:roomId/leave', authMiddleware, leaveRoom);

module.exports = router;