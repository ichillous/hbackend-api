const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPaid: { type: Boolean, default: false },
    price: { type: Number },
    schedule: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    type: { type: String, enum: ["class", "circle"], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);
