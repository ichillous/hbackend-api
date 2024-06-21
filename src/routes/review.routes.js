const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/group/:groupId', reviewController.getGroupReviews);

module.exports = router;