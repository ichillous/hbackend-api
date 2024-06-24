// src/routes/payment.routes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/create-payment-intent', authMiddleware, apiLimiter, paymentController.createPaymentIntent);
router.post('/:paymentId/confirm', authMiddleware, paymentController.confirmPayment);
router.get('/user', authMiddleware, paymentController.getPaymentsByUser);
router.get('/recipient/:recipientId', authMiddleware, paymentController.getPaymentsByRecipient);
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleStripeWebhook);

module.exports = router;