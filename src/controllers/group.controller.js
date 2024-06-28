// src/controllers/group.controller.js
const Group = require("../models/Group");
const Payment = require("../models/Payment");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('../config/firebase-admin');
const { v4: uuidv4 } = require('uuid');

exports.createGroup = async (req, res) => {
  try {
    const { name, description, type, isPaid, price, schedule, startDate, endDate, maxMembers } = req.body;

    const group = new Group({
      name,
      description,
      createdBy: req.user.userId,
      type,
      isPaid,
      price,
      schedule,
      startDate,
      endDate,
      maxMembers,
      isInstitutionOrInstructor: ['instructor', 'institution'].includes(req.user.role),
    });

    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error creating group", error: error.message });
  }
};

// Add these methods to your group.controller.js file

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    
    if (group.createdBy.toString() !== req.user.userId && !group.admins.includes(req.user.userId)) {
      return res.status(403).json({ message: "You don't have permission to update this group" });
    }
    
    Object.assign(group, req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    
    if (group.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the group creator can delete the group" });
    }
    
    await Group.findByIdAndDelete(req.params.id);
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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

    const groups = await Group.findAll(query, page, limit);
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

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.userId)) {
      return res.status(400).json({ message: "You are already a member of this group" });
    }

    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "This group has reached its maximum member limit" });
    }

    if (group.type === 'class' && group.isPaid) {
      // Check if the user has paid for the class
      const payment = await Payment.findOne({ 
        payerId: req.user.userId, 
        recipientId: group.createdBy, 
        type: 'class', 
        classId: group._id,
        status: 'completed'
      });

      if (!payment) {
        return res.status(403).json({ message: "You need to pay for this class before joining" });
      }
    }

    await group.addMember(req.user.userId);
    res.json({ message: "Successfully joined the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(req.user.userId)) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    await group.removeMember(req.user.userId);
    res.json({ message: "Successfully left the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.payForClass = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group || group.type !== 'class' || !group.isPaid) {
      return res.status(400).json({ message: "Invalid class or payment not required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: group.price * 100, // Stripe expects amount in cents
      currency: group.currency,
      customer: req.user.stripeCustomerId,
      metadata: { 
        userId: req.user.userId,
        groupId: group._id.toString(),
        groupName: group.name
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
};
// Add a member as admin



exports.createWebRTCRoom = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (
      group.createdBy.toString() !== req.user.userId &&
      !group.moderators.includes(req.user.userId)
    ) {
      return res
        .status(403)
        .json({ message: "Only group creators or moderators can create WebRTC rooms" });
    }

    const roomId = await group.createWebRTCRoom();
    res.json({ message: "WebRTC room created for the group", roomId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join VOIP call
exports.joinWebRTCRoom = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.webrtcRoomId) {
      return res.status(400).json({ message: "WebRTC room is not created for this group" });
    }

    if (!group.members.includes(req.user.userId)) {
      return res.status(403).json({ message: "You must be a member of the group to join the call" });
    }

    if (group.type === 'class' && !group.isLive()) {
      return res.status(403).json({ message: "This class is not live yet" });
    }

    if (!group.speakers.includes(req.user.userId) && !group.raiseHandEnabled) {
      return res.status(403).json({ message: "You need to be a speaker or raise your hand to join the call" });
    }

    await group.addActiveWebRTCMember(req.user.userId);

    res.json({
      message: "Joined WebRTC room",
      roomId: group.webrtcRoomId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave VOIP call
exports.leaveWebRTCRoom = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    await group.removeActiveWebRTCMember(req.user.userId);

    res.json({ message: "Left WebRTC room" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get active VOIP members
exports.getActiveWebRTCMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json(group.activeWebRTCMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addModerator = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Check if the user is the creator or a moderator
    if (
      group.createdBy.toString() !== req.user.userId &&
      !group.moderators.includes(req.user.userId)
    ) {
      return res.status(403).json({
        message: "Only the group creator or moderators can add new moderators",
      });
    }

    const newModeratorId = req.body.userId;
    if (!group.members.includes(newModeratorId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this group" });
    }

    if (group.moderators.includes(newModeratorId)) {
      return res.status(400).json({ message: "User is already a moderator" });
    }

    await group.addModerator(newModeratorId);

    res.json({ message: "Successfully added moderator to the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeModerator = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Only the creator can remove moderators" });
    }

    const moderatorId = req.body.userId;
    await group.removeModerator(moderatorId);

    res.json({ message: "Moderator removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleChat = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.moderators.includes(req.user.userId)) {
      return res.status(403).json({ message: "Only moderators can toggle chat" });
    }

    const { enabled } = req.body;
    await group.toggleChat(enabled);

    res.json({ message: `Chat ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleRaiseHand = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.moderators.includes(req.user.userId)) {
      return res.status(403).json({ message: "Only moderators can toggle raise hand feature" });
    }

    const { enabled } = req.body;
    await group.toggleRaiseHand(enabled);

    res.json({ message: `Raise hand feature ${enabled ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addSpeaker = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.moderators.includes(req.user.userId)) {
      return res.status(403).json({ message: "Only moderators can add speakers" });
    }

    const speakerId = req.body.userId;
    await group.addSpeaker(speakerId);

    res.json({ message: "Speaker added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeSpeaker = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.moderators.includes(req.user.userId)) {
      return res.status(403).json({ message: "Only moderators can remove speakers" });
    }

    const speakerId = req.body.userId;
    await group.removeSpeaker(speakerId);

    res.json({ message: "Speaker removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



module.exports = exports;
