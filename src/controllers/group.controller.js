const Group = require("../models/Group");
const User = require("../models/User");
const { paginateResults } = require("../utils/pagination");
const notificationController = require("./notification.controller");
const twilioService = require('../services/twilio.service');

// Create a group
exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPaid, price, schedule, type, maxMembers } = req.body;
    
    const group = new Group({
      name,
      description,
      createdBy: req.user.userId,
      isPaid,
      price,
      schedule,
      type,
      maxMembers,
      isClass: type === "class",
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation Error", errors });
    }
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

// Get groups
exports.getGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    const searchTerm = req.query.search;

    let query = {};
    if (searchTerm) {
      query = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      };
    }

    const groups = await Group.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .populate("createdBy", "name");

    const total = await Group.countDocuments(query);

    res.json({
      groups,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalGroups: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await Group.find({
      $or: [{ createdBy: userId }, { members: userId }, { admins: userId }],
    }).populate("createdBy", "name");

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("members", "name")
      .populate("admins", "name");
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update group
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only update groups you created" });
    }
    Object.assign(group, req.body);
    await group.save();
    await notificationController.notifyGroupUpdate(group._id);
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a group
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete groups you created" });
    }
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join a Circle/Class
exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    // Check if the group has reached its maximum member limit
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return res
        .status(400)
        .json({ message: "This group has reached its maximum member limit" });
    }

    group.members.push(req.user.userId);
    await group.save();

    res.json({ message: "Successfully joined the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.user.userId
    );
    await group.save();

    res.json({ message: "Successfully left the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a member as admin
exports.addAdmin = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if the user is the creator or an admin
    if (
      group.createdBy.toString() !== req.user.userId &&
      !group.admins.includes(req.user.userId)
    ) {
      return res
        .status(403)
        .json({
          message: "Only the group creator or admins can add new admins",
        });
    }

    const newAdminId = req.body.userId;
    if (!group.members.includes(newAdminId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this group" });
    }

    if (!group.admins) group.admins = [];
    if (group.admins.includes(newAdminId)) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    group.admins.push(newAdminId);
    await group.save();

    res.json({ message: "Successfully added admin to the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enableVoip = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    
    if (group.createdBy.toString() !== req.user.userId && !group.admins.includes(req.user.userId)) {
      return res.status(403).json({ message: "Only group creators or admins can enable VOIP" });
    }

    group.voipEnabled = true;
    await group.save();

    res.json({ message: "VOIP enabled for the group", group });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join VOIP call
exports.joinVoipCall = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    
    if (!group.voipEnabled) {
      return res.status(400).json({ message: "VOIP is not enabled for this group" });
    }

    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "You must be a member of the group to join the call" });
    }

    if (!group.activeVoipMembers.includes(req.user.userId)) {
      group.activeVoipMembers.push(req.user.userId);
      await group.save();
    }

    // Generate Twilio Voice Token
    const token = twilioService.generateVoiceToken(req.user.userId, group._id);

    res.json({ 
      message: "Joined VOIP call", 
      groupId: group._id,
      token: token,
      roomName: `group-${group._id}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Leave VOIP call
exports.leaveVoipCall = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.activeVoipMembers = group.activeVoipMembers.filter(
      memberId => memberId.toString() !== req.user.userId
    );
    await group.save();

    res.json({ message: "Left VOIP call" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get active VOIP members
exports.getActiveVoipMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('activeVoipMembers', 'name');
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group.activeVoipMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = exports;

