const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  address: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  favorited_by: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  favoriteCount: {
    type: Number,
    default: 0
  },
  image: { type: String }
}, { timestamps: true });

eventSchema.index({ location: '2dsphere' }); // For geospatial queries

module.exports = mongoose.model('Event', eventSchema);