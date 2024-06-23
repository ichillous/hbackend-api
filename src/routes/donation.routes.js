const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const authMiddleware = require('../middleware/auth');

// Webhook route should be first to ensure it uses the raw body parser
router.post('/webhook', donationController.handleStripeWebhook);

router.post('/create', authMiddleware, donationController.createDonation);
router.post('/:donationId/confirm', authMiddleware, donationController.confirmDonation);
router.get('/user', authMiddleware, donationController.getDonationsByUser);
router.get('/institution/:institutionId', authMiddleware, donationController.getDonationsByInstitution);

module.exports = router;