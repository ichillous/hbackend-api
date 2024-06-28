// src/models/Payment.js

const { connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Payment {
  constructor(paymentData) {
    this._id = paymentData._id;
    this.amount = paymentData.amount;
    this.currency = paymentData.currency;
    this.payerId = paymentData.payerId;
    this.recipientId = paymentData.recipientId;
    this.type = paymentData.type;
    this.groupId = paymentData.groupId; // Changed from classId to groupId
    this.status = paymentData.status || 'pending';
    this.stripePaymentIntentId = paymentData.stripePaymentIntentId;
    this.platformFee = paymentData.platformFee;
    this.createdAt = paymentData.createdAt || new Date();
  }

  async save() {
    const db = await connectToDatabase();
    if (this._id) {
      await db.collection('payments').updateOne(
        { _id: new ObjectId(this._id) },
        { $set: this }
      );
    } else {
      const result = await db.collection('payments').insertOne(this);
      this._id = result.insertedId;
    }
    return this;
  }

  static async findById(id) {
    const db = await connectToDatabase();
    const payment = await db.collection('payments').findOne({ _id: new ObjectId(id) });
    return payment ? new Payment(payment) : null;
  }

  static async findByStripePaymentIntentId(stripePaymentIntentId) {
    const db = await connectToDatabase();
    const payment = await db.collection('payments').findOne({ stripePaymentIntentId });
    return payment ? new Payment(payment) : null;
  }

  static async getAll(query = {}, page = 1, limit = 20) {
    const db = await connectToDatabase();
    const skip = (page - 1) * limit;
    const payments = await db.collection('payments')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    return payments.map(payment => new Payment(payment));
  }

  static async getTotalPlatformEarnings() {
    const db = await connectToDatabase();
    const result = await db.collection('payments').aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]).toArray();
    return result.length > 0 ? result[0].total : 0;
  }
}

module.exports = Payment;