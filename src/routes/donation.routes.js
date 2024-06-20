const express = require('express');
const router = express.Router();

// TODO: Implement donation controller
// const donationController = require('../controllers/donation.controller');

router.post('/', (req, res) => {
  // TODO: Implement create donation
  res.status(501).json({ message: 'Create donation not implemented yet' });
});

router.get('/history', (req, res) => {
  // TODO: Implement get donation history
  res.status(501).json({ message: 'Get donation history not implemented yet' });
});

module.exports = router;