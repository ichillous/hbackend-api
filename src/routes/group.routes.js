// src/routes/group.routes.js
const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const { authMiddleware } = require("../middleware/auth");

// Ensure all these methods are defined in your groupController
router.get("/", groupController.getGroups);
router.post("/", authMiddleware, groupController.createGroup);
router.get("/:id", groupController.getGroupById);
router.put("/:id", authMiddleware, groupController.updateGroup);
router.delete("/:id", authMiddleware, groupController.deleteGroup);
router.post("/:id/join", authMiddleware, groupController.joinGroup);
router.post("/:id/leave", authMiddleware, groupController.leaveGroup);
router.post('/:id/create-webrtc-room', authMiddleware, groupController.createWebRTCRoom);
router.post('/:id/join-webrtc', authMiddleware, groupController.joinWebRTCRoom);
router.post('/:id/leave-webrtc', authMiddleware, groupController.leaveWebRTCRoom);
router.get('/:id/active-webrtc-members', authMiddleware, groupController.getActiveWebRTCMembers);
router.post('/:id/pay', authMiddleware, groupController.payForClass);
router.post("/:id/moderator", authMiddleware, groupController.addModerator);
router.delete("/:id/moderator", authMiddleware, groupController.removeModerator);
router.put("/:id/chat", authMiddleware, groupController.toggleChat);
router.put("/:id/raise-hand", authMiddleware, groupController.toggleRaiseHand);
router.post("/:id/speaker", authMiddleware, groupController.addSpeaker);
router.delete("/:id/speaker", authMiddleware, groupController.removeSpeaker);

module.exports = router;