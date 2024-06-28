const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution.controller');
const { authMiddleware, isInstitution } = require('../middleware/auth');

router.put('/profile', authMiddleware, isInstitution, institutionController.updateInstitutionProfile);
router.get('/:id', institutionController.getInstitutionDetails);
router.post('/:id/follow', authMiddleware, institutionController.addFollower);
router.post('/:id/unfollow', authMiddleware, institutionController.removeFollower);
router.get('/:id/followers', authMiddleware, isInstitution, institutionController.getInstitutionFollowers);
router.put('/prayer-times', authMiddleware, isInstitution, institutionController.updatePrayerTimes);

module.exports = router;