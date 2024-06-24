const express = require("express");
const router = express.Router();
const instructorController = require("../controllers/instructor.controller");
const { authMiddleware, isInstructor } = require("../middleware/auth.js");

console.log("authMiddleware:", authMiddleware);
console.log("isInstructor:", isInstructor);
console.log("instructorController:", instructorController);

// Instructor routes
router.post(
  "/classes",
  (req, res, next) => {
    console.log("authMiddleware running");
    if (typeof authMiddleware === "function") {
      authMiddleware(req, res, next);
    } else {
      console.error("authMiddleware is not a function");
      next();
    }
  },
  (req, res, next) => {
    console.log("isInstructor running");
    if (typeof isInstructor === "function") {
      isInstructor(req, res, next);
    } else {
      console.error("isInstructor is not a function");
      next();
    }
  },
  (req, res) => {
    console.log("createClass running");
    instructorController.createClass(req, res);
  }
);

router.get(
  "/classes",
  (req, res, next) => {
    console.log("authMiddleware running");
    if (typeof authMiddleware === "function") {
      authMiddleware(req, res, next);
    } else {
      console.error("authMiddleware is not a function");
      next();
    }
  },
  (req, res, next) => {
    console.log("isInstructor running");
    if (typeof isInstructor === "function") {
      isInstructor(req, res, next);
    } else {
      console.error("isInstructor is not a function");
      next();
    }
  },
  (req, res) => {
    console.log("getInstructorClasses running");
    instructorController.getInstructorClasses(req, res);
  }
);

// Add similar debug wrappers for other routes...

module.exports = router;
