const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { authMiddleware } = require("../middleware/auth");

router.post("/", authMiddleware, eventController.createEvent);
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.put("/:id", authMiddleware, eventController.updateEvent);
router.delete("/:id", authMiddleware, eventController.deleteEvent);
router.post("/:id/attend", authMiddleware, eventController.attendEvent);
router.get("/nearby", eventController.getNearbyEvents);
router.post("/:id/favorite", authMiddleware, eventController.favoriteEvent);

module.exports = router;
