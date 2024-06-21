const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/instructor.controller');
const authMiddleware = require('../middleware/auth');

// Middleware to check if the user is an instructor
const isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'instructor') {
      return res.status(403).json({ message: 'Access denied. Only instructors can perform this action.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

router.post('/classes', authMiddleware, isInstructor, instructorController.createClass);
router.get('/classes', authMiddleware, isInstructor, instructorController.getInstructorClasses);
router.put('/classes/:classId', authMiddleware, isInstructor, instructorController.updateClass);
router.delete('/classes/:classId', authMiddleware, isInstructor, instructorController.deleteClass);
router.get('/classes/:classId/members', authMiddleware, isInstructor, instructorController.getClassMembers);

module.exports = router;