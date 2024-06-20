const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    location: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "instructor", "institution"],
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
    // Additional fields for instructors and institutions
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
      },
    ],
    nonProfitName: {
      type: String,
    },
    documentsUploaded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

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

mongoose.connect("mongodb://localhost:27017/husna_app");

module.exports = mongoose.model("User", UserSchema);
