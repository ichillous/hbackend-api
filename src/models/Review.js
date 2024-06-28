// /Users/isiahchillous/Documents/dev/backend/hbackend-api/src/models/Review.js

const { connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Review {
  constructor(reviewData) {
    this._id = reviewData._id;
    this.user = reviewData.user;
    this.group = reviewData.group;
    this.rating = reviewData.rating;
    this.comment = reviewData.comment;
    this.createdAt = reviewData.createdAt || new Date();
  }

  static async createIndexes() {
    const db = connectToDatabase();
    await db.collection('reviews').createIndex({ user: 1, group: 1 }, { unique: true });
  }

  async save() {
    const db = connectToDatabase();
    if (this._id) {
      return await db.collection('reviews').updateOne(
        { _id: new ObjectId(this._id) },
        { $set: this }
      );
    } else {
      const result = await db.collection('reviews').insertOne(this);
      this._id = result.insertedId;
      return result;
    }
  }

  static async findById(id) {
    const db = connectToDatabase();
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
    return review ? new Review(review) : null;
  }

  // Add more methods as needed
}

module.exports = Review;