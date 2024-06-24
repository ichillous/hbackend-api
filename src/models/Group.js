const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    schedule: { type: String },
    type: { type: String, enum: ["circle", "class"], required: true },
    maxMembers: { type: Number },
    isClass: { type: Boolean, default: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    voipEnabled: { type: Boolean, default: false },
    activeVoipMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    voipRoomSid: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);