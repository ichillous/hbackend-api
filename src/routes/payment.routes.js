const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth');

router.post('/create-payment-intent', authMiddleware, paymentController.createPaymentIntent);
router.post('/donate', authMiddleware, paymentController.processDonation);
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.webhook);

module.exports = router;