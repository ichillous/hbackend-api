const Notification = require("../models/Notification");
const User = require("../models/User");
const Event = require("../models/Event");
const Group = require("../models/Group");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .sort("-createdAt")
      .limit(20); // Limit to the 20 most recent notifications
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEventReminder = async (eventId) => {
  const event = await Event.findById(eventId).populate("attendees");
  const reminderTime = new Date(event.date);
  reminderTime.setHours(reminderTime.getHours() - 1); // Set reminder 1 hour before event

  event.attendees.forEach(async (attendee) => {
    await Notification.create({
      recipient: attendee._id,
      type: "event_reminder",
      relatedItem: event._id,
      itemType: "Event",
      message: `Reminder: "${event.title}" starts in 1 hour.`,
    });
  });
};

exports.notifyNewEvent = async (eventId) => {
  const event = await Event.findById(eventId).populate("organizer");
  const followers = await User.find({
    favoriteInstitutions: event.organizer._id,
  });

  followers.forEach(async (follower) => {
    await Notification.create({
      recipient: follower._id,
      type: "new_event",
      relatedItem: event._id,
      itemType: "Event",
      message: `${event.organizer.name} has created a new event: "${event.title}".`,
    });
  });
};

exports.notifyGroupUpdate = async (groupId) => {
  const group = await Group.findById(groupId);

  group.members.forEach(async (memberId) => {
    await Notification.create({
      recipient: memberId,
      type: "group_update",
      relatedItem: group._id,
      itemType: "Group",
      message: `The group "${group.name}" has been updated.`,
    });
  });
};


exports.notifyModeratorChange = async (groupId, userId, isAdded) => {
  const group = await Group.findById(groupId);
  await Notification.create({
    recipient: userId,
    type: isAdded ? "moderator_added" : "moderator_removed",
    relatedItem: groupId,
    itemType: "Group",
    message: isAdded ? `You have been added as a moderator for the group "${group.name}".` : `You have been removed as a moderator from the group "${group.name}".`,
  });
};
exports.notifyClassCreated = async (classId) => {
  const classGroup = await Group.findById(classId).populate("createdBy");
  await Notification.create({
    recipient: classGroup.createdBy,
    type: "class_created",
    relatedItem: classId,
    itemType: "Class",
    message: `You have successfully created the class "${classGroup.name}".`,
  });
};

exports.notifyClassJoined = async (classId, userId) => {
  const classGroup = await Group.findById(classId).populate("createdBy");
  await Notification.create({
    recipient: classGroup.createdBy,
    type: "class_joined",
    relatedItem: classId,
    itemType: "Class",
    message: `A new user has joined your class "${classGroup.name}".`,
  });
};
exports.notifySpeakerChange = async (groupId, userId, isAdded) => {
  const group = await Group.findById(groupId);
  await Notification.create({
    recipient: userId,
    type: isAdded ? "speaker_added" : "speaker_removed",
    relatedItem: groupId,
    itemType: "Group",
    message: isAdded ? `You have been added as a speaker for the group "${group.name}".` : `You have been removed as a speaker from the group "${group.name}".`,
  });
};

exports.notifyPaymentSuccess = async (userId, groupId, amount) => {
  const group = await Group.findById(groupId);
  await Notification.create({
    recipient: userId,
    type: "payment_success",
    relatedItem: groupId,
    itemType: "Group",
    message: `Your payment of ${amount} for the group "${group.name}" was successful.`,
  });
};