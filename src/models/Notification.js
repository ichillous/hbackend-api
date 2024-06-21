const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["event_reminder", "new_event", "group_update"],
    required: true,
  },
  relatedItem: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "itemType",
  },
  itemType: {
    type: String,
    enum: ["Event", "Group", "User"],
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
