const express = require("express");
const router = express.Router();

// Import group controller
const groupController = require("../controllers/group.controller");
// Import auth middleware
const authMiddleware = require("../middleware/auth");

router.get("/", groupController.getGroups);
router.post("/", authMiddleware, groupController.createGroup);
router.get("/:id", groupController.getGroupById);
router.put("/:id", authMiddleware, groupController.updateGroup);
router.delete("/:id", authMiddleware, groupController.deleteGroup);
router.post("/:id/join", authMiddleware, groupController.joinGroup);
router.post("/:id/leave", authMiddleware, groupController.leaveGroup);
router.post("/:id/admin", authMiddleware, groupController.addAdmin);
router.post('/:id/enable-voip', authMiddleware, groupController.enableVoip);
router.post('/:id/join-voip', authMiddleware, groupController.joinVoipCall);
router.post('/:id/leave-voip', authMiddleware, groupController.leaveVoipCall);
router.get('/:id/active-voip-members', authMiddleware, groupController.getActiveVoipMembers);

module.exports = router;
