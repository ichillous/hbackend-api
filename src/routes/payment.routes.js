// src/routes/payment.routes.js

const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

router.post('/create-account', authMiddleware, paymentController.createStripeAccount);
router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/webhook', paymentController.handleStripeWebhook);
router.get('/all', authMiddleware, isAdmin, paymentController.getPayments);
router.get('/platform-earnings', authMiddleware, isAdmin, paymentController.getPlatformEarnings);

module.exports = router;