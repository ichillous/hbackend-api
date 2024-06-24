const express = require('express');
const router = express.Router();

const institutionController = require('../controllers/institution.controller');
const authMiddleware = require('../middleware/auth');
// TODO: Implement institution controller
// const institutionController = require('../controllers/institution.controller');


router.post('/events', authMiddleware, institutionAuthMiddleware, institutionController.createEvent);
router.get('/events', authMiddleware, institutionController.getInstitutionEvents);
router.put('/events/:id', authMiddleware, institutionAuthMiddleware, institutionController.updateEvent);
router.delete('/events/:id', authMiddleware, institutionAuthMiddleware, institutionController.deleteEvent);
router.get('/nearest-mosque', institutionController.getNearestMosque);
router.put('/prayer-times', authMiddleware, institutionController.updatePrayerTimes);


module.exports = router;