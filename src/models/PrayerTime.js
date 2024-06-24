const mongoose = require('mongoose');

const prayerTimeSchema = new mongoose.Schema({
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  fajr: {
    type: String,
    required: true
  },
  dhuhr: {
    type: String,
    required: true
  },
  asr: {
    type: String,
    required: true
  },
  maghrib: {
    type: String,
    required: true
  },
  isha: {
    type: String,
    required: true
  },
  isCustom: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Compound index for efficient queries
prayerTimeSchema.index({ institution: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('PrayerTime', prayerTimeSchema);