const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const authController = require("../controllers/auth.controller");
const upload = require("../middleware/upload");

// TODO: Implement auth controller
// const authController = require('../controllers/auth.controller');

router.post(
  "/register",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  authController.register
);

router.post("/login", authController.login);

exports.logout = (req, res) => {
  res.status(501).json({ message: "Logout not implemented yet" });
};

exports.refreshToken = (req, res) => {
  res.status(501).json({ message: "Token refresh not implemented yet" });
};
module.exports = router;
