const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// For institutions
const prayerTimeSchema = new mongoose.Schema(
  {
    fajr: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    birthday: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
      required: true,
    },
    organizationType: {
      type: String,
      enum: ["mosque", "charity", "educational", "other"],
      required: function () {
        return this.role === "institution";
      },
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    address: {
      type: String,
      required: function () {
        return this.role === "institution";
      },
    },
    prayerTimes: {
      type: prayerTimeSchema,
      required: function () {
        return (
          this.role === "institution" && this.organizationType === "mosque"
        );
      },
    },
    profilePicture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "instructor", "institution", "admin"],
      required: true,
    },
    interests: [
      {
        type: String,
        enum: [
          "Quran",
          "Hadith",
          "Fiqh",
          "Seerah",
          "Islamic History",
          "Contemporary issues",
        ],
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    // Fields for instructors
    skills: [
      {
        type: String,
      },
    ],
    services: [
      {
        type: String,
      },
    ],
    languages: [
      {
        type: String,
        enum: require("../config/languages"),
      },
    ],
    teachingExperience: {
      type: Number,
      default: 0,
    },
    // Fields for institutions
    nonProfitName: {
      type: String,
    },
    organizationType: {
      type: String,
    },
    documentsUploaded: {
      type: Boolean,
      default: false,
    },
    // Fields for both instructors and institutions
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
      },
    ],
    favoriteEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    favoriteInstructors: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    favoriteInstitutions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ location: "2dsphere" });

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to check password
UserSchema.methods.checkPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Calculate average rating
UserSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  return this.averageRating;
};

module.exports = mongoose.model("User", UserSchema);
