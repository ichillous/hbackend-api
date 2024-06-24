const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middleware/auth');

router.post('/create', authMiddleware, chatController.createChat);
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/:chatId/messages', authMiddleware, chatController.getChatMessages);
router.get('/user', authMiddleware, chatController.getUserChats);
router.post('/:chatId/messages/:messageId/read', authMiddleware, chatController.markMessageAsRead);

module.exports = router;