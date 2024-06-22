const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const authMiddleware = require('../middleware/auth');

router.post('/create', authMiddleware, donationController.createDonation);
router.post('/:donationId/confirm', authMiddleware, donationController.confirmDonation);
router.post('/webhook', express.raw({type: 'application/json'}), donationController.handleStripeWebhook);
router.get('/user', authMiddleware, donationController.getDonationsByUser);
router.get('/institution/:institutionId', authMiddleware, donationController.getDonationsByInstitution);

module.exports = router;