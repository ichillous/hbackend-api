// /Users/isiahchillous/Documents/dev/backend/hbackend-api/src/models/Event.js

const { connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Event {
  constructor(eventData) {
    this._id = eventData._id;
    this.title = eventData.title;
    this.description = eventData.description;
    this.startTime = eventData.startTime;
    this.endTime = eventData.endTime;
    this.location = eventData.location;
    this.organizer = eventData.organizer;
    this.attendees = eventData.attendees || [];
    this.maxAttendees = eventData.maxAttendees;
    this.isOnline = eventData.isOnline || false;
    this.onlineLink = eventData.onlineLink;
    this.tags = eventData.tags || [];
    this.isPublic = eventData.isPublic !== undefined ? eventData.isPublic : true;
    this.createdAt = eventData.createdAt || new Date();
    this.updatedAt = eventData.updatedAt || new Date();
  }

  static async createIndexes() {
    const db = connectToDatabase();
    await db.collection('events').createIndex({ location: '2dsphere' });
  }

  async save() {
    const db = connectToDatabase();
    this.updatedAt = new Date();
    if (this._id) {
      return await db.collection('events').updateOne(
        { _id: new ObjectId(this._id) },
        { $set: this }
      );
    } else {
      const result = await db.collection('events').insertOne(this);
      this._id = result.insertedId;
      return result;
    }
  }

  static async findById(id) {
    const db = connectToDatabase();
    const event = await db.collection('events').findOne({ _id: new ObjectId(id) });
    return event ? new Event(event) : null;
  }

  // Add more methods as needed
}

module.exports = Event;