// src/controllers/auth.controller.js
const User = require("../models/User");
const admin = require('../config/firebase-admin');

exports.signup = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify the Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email } = decodedToken;

    // Check if the user exists in your database
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // If the user doesn't exist, you might want to create a new user
      // or return an error if only pre-registered users are allowed
      return res.status(403).json({ message: 'User not registered in the system' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Generate a session token or use the Firebase token as is
    // For simplicity, we'll use the Firebase token here
    const token = firebaseToken;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Invalid credentials' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid } = decodedToken;

    // Find user in your MongoDB
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: "User not found. Please sign up." });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in signin function:', error);
    res.status(500).json({ message: "Error signing in", error: error.message });
  }
};

// Logout doesn't need to do anything on the server side when using Firebase Auth
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};