const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const userController = require("../controllers/user.controller");

// TODO: Implement user controller
// const userController = require('../controllers/user.controller');
console.log('authMiddleware:', authMiddleware);
console.log('userController:', userController);

router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.get('/languages', userController.getLanguages);

router.get("/events", authMiddleware, (req, res) => {
  // TODO: Implement get user events
  res.status(501).json({ message: "Get user events not implemented yet" });
});

router.get("/groups", authMiddleware, (req, res) => {
  // TODO: Implement get user groups (classes and circles)
  res.status(501).json({ message: "Get user groups not implemented yet" });
});


module.exports = router;