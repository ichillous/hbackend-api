const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution.controller');
const { authMiddleware } = require('../middleware/auth');
const institutionAuthMiddleware = require('../middleware/institutionAuth');

// Institution routes
router.put('/profile', authMiddleware, institutionAuthMiddleware, institutionController.updateInstitutionProfile);
router.get('/:id', institutionController.getInstitutionDetails);
router.post('/:id/follow', authMiddleware, institutionController.addFollower);
router.post('/:id/unfollow', authMiddleware, institutionController.removeFollower);
router.get('/:id/followers', authMiddleware, institutionAuthMiddleware, institutionController.getInstitutionFollowers);

module.exports = router;