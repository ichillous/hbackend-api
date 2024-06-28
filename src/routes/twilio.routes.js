// src/routes/twilio.routes.js
const express = require('express');
const router = express.Router();
const twilioController = require('../controllers/twilio.controller');

router.post('/voice', twilioController.handleVoiceRequest);

module.exports = router;
