const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxAttendees: { type: Number },
  isOnline: { type: Boolean, default: false },
  onlineLink: { type: String },
  tags: [String],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

eventSchema.index({ location: '2dsphere' });