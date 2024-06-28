const express = require('express');
const router = express.Router();
const prayerTimeController = require('../controllers/prayerTime.controller');
const {authMiddleware, isInstitution} = require('../middleware/auth');

// Route to get prayer times (accessible to all authenticated users)
router.get('/', authMiddleware, prayerTimeController.getPrayerTimes);

// Route to set custom prayer times (accessible only to authorized institutions)
router.post('/custom', authMiddleware, isInstitution, prayerTimeController.setCustomPrayerTimes);

module.exports = router;