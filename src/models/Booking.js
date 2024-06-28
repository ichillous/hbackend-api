// /Users/isiahchillous/Documents/dev/backend/hbackend-api/src/models/Booking.js

const { connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Booking {
  constructor(bookingData) {
    this._id = bookingData._id;
    this.user = bookingData.user;
    this.event = bookingData.event;
    this.status = bookingData.status || 'confirmed';
    this.createdAt = bookingData.createdAt || new Date();
    this.updatedAt = bookingData.updatedAt || new Date();
  }

  async save() {
    const db = connectToDatabase();
    this.updatedAt = new Date();
    if (this._id) {
      return await db.collection('bookings').updateOne(
        { _id: new ObjectId(this._id) },
        { $set: this }
      );
    } else {
      const result = await db.collection('bookings').insertOne(this);
      this._id = result.insertedId;
      return result;
    }
  }

  static async findById(id) {
    const db = connectToDatabase();
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId(id) });
    return booking ? new Booking(booking) : null;
  }

  // Add more methods as needed
}

module.exports = Booking;