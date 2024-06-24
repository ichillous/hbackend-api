const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.post('/create-payment-intent', authMiddleware, apiLimiter, paymentController.createPaymentIntent);
router.post('/donate', authMiddleware, apiLimiter, paymentController.processDonation);
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.webhook);
router.get('/test-stripe-connection', paymentController.testStripeConnection);
module.exports = router;