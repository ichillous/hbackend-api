// /Users/isiahchillous/Documents/dev/backend/hbackend-api/src/models/User.js

const { connectToDatabase } = require("../config/database");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const UserRoles = {
  ADMIN: "admin",
  USER: "user",
  INSTRUCTOR: "instructor",
  INSTITUTION: "institution",
};

class User {
  constructor(userData) {
    Object.assign(this, userData);
    this.firebaseUid = userData.firebaseUid;
    this.role = userData.role || UserRoles.USER;
    this.stripeAccountId = userData.stripeAccountId;
    this.stripeOnboardingComplete = userData.stripeOnboardingComplete || false;
    this.isVerified = userData.isVerified || false;
    this.verificationStatus = userData.verificationStatus || "pending";
    this.name = userData.name;
    this.dob = userData.dob;
    this.gender = userData.gender;
    this.email = userData.email;
    this.phoneNumber = userData.phoneNumber;
    this.password = userData.password; // Remember to hash this before saving
    this.location = userData.location;
  }

  // Save user to database
  async save() {
    const db = await connectToDatabase();
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
    if (this._id) {
      // Update existing user
      const result = await db
        .collection("users")
        .updateOne({ _id: new ObjectId(this._id) }, { $set: this });
      return result;
    } else {
      // Insert new user
      const result = await db.collection("users").insertOne(this);
      this._id = result.insertedId;
      return result;
    }
  }

  async checkPassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  async updateStripeAccount(stripeAccountId, onboardingComplete = false) {
    this.stripeAccountId = stripeAccountId;
    this.stripeOnboardingComplete = onboardingComplete;
    await this.save();
  }

  static async findOne(query) {
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne(query);
    return user ? new User(user) : null;
  }

  // Find or create user based on Google ID
  static async findOrCreateByGoogleId(googleData) {
    const db = await connectToDatabase();
    let user = await db
      .collection("users")
      .findOne({ googleId: googleData.sub });

    if (!user) {
      user = new User({
        googleId: googleData.sub,
        email: googleData.email,
        name: googleData.name,
        isVerified: googleData.email_verified,
        role: UserRoles.USER,
      });
      await user.save();
    }

    return new User(user);
  }

  static async findById(id) {
    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    return user ? new User(user) : null;
  }

  static async findByEmail(email) {
    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });
    return user ? new User(user) : null;
  }

  static async findByUsername(username) {
    const db = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ username: username.trim() });
    return user ? new User(user) : null;
  }

  static async findByRole(role) {
    const db = await connectToDatabase();
    const users = await db.collection("users").find({ role }).toArray();
    return users.map((user) => new User(user));
  }

  calculateAverageRating() {
    if (this.ratings.length === 0) {
      this.averageRating = 0;
    } else {
      const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
      this.averageRating = sum / this.ratings.length;
    }
    return this.averageRating;
  }

  isModified(field) {
    // TODO: Implement proper change tracking mechanism
    return true;
  }

  static async createIndexes() {
    const db = await connectToDatabase();
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db
      .collection("users")
      .createIndex({ firebaseUid: 1 }, { unique: true });
    await db.collection("users").createIndex({ username: 1 }, { unique: true });
    await db.collection("users").createIndex({ googleId: 1 }, { unique: true });
    await db
      .collection("users")
      .createIndex({ phoneNumber: 1 }, { unique: true });
    await db.collection("users").createIndex({ location: "2dsphere" });
    await db.collection("users").createIndex({ role: 1 });
  }
}

module.exports = User;
