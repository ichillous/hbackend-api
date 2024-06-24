// src/models/Payment.js

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'usd'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['donation', 'class_payment'],
    required: true
  },
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedEntityType'
  },
  relatedEntityType: {
    type: String,
    enum: ['Donation', 'Group'],
    required: function() { return this.relatedEntity != null; }
  },
  stripePaymentIntentId: {
    type: String
  },
  message: {
    type: String,
    maxlength: 500
  },
  recurringType: {
    type: String,
    enum: ['one-time', 'weekly', 'monthly', 'yearly'],
    default: 'one-time'
  },
  recurringEndDate: Date,
  recurringStatus: {
    type: String,
    enum: ['active', 'paused', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);