// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authMiddleware, isAdmin } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, isAdmin, adminController.getDashboardStats);
router.get('/users', authMiddleware, isAdmin, adminController.getUsers);
router.put('/user/status', authMiddleware, isAdmin, adminController.updateUserStatus);
router.put('/instructor/approve', authMiddleware, isAdmin, adminController.approveInstructor);
router.get('/payments/recent', authMiddleware, isAdmin, adminController.getRecentPayments);


module.exports = router;