// src/routes/admin.routes.js

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/admin');

// Apply authMiddleware and adminAuthMiddleware to all routes
router.use(authMiddleware, adminAuthMiddleware);

router.get("/dashboard", adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.put('/user/status', adminController.updateUserStatus);
router.put('/instructor/approve', adminController.approveInstructor);
router.get('/payments/recent', adminController.getRecentPayments);
router.get('/instructors', adminController.getInstructors);
router.get('/institutions', adminController.getInstitutions);
router.get('/pending-approvals', adminController.getPendingApprovals);
router.post('/approve-instructor', adminController.approveInstructor);
router.post('/approve-institution', adminController.approveInstitution);
router.post('/reject-approval', adminController.rejectApproval);
router.get('/verification-details/:userId', adminController.getVerificationDetails);

module.exports = router;