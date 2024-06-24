
const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verification.controller');

router.post('/upload', authMiddleware, upload.single('document'), verificationController.uploadDocument);
router.get('/admin/pending', adminAuthMiddleware, verificationController.getPendingVerifications);
router.put('/admin/review/:id', adminAuthMiddleware, verificationController.reviewVerification);

module.exports = router;