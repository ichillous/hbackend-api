const User = require("../models/User");
const { signToken } = require("../utils/jwt");

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      username,
      birthday,
      gender,
      location,
      role,
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      email,
      password,
      name,
      username,
      birthday,
      gender,
      location,
      role,
    });
    await user.save();

    console.log("User saved successfully, attempting to sign token");
    console.log("User ID:", user._id);

    const token = signToken({ userId: user._id });
    console.log("Token signed successfully");

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in register function:", error);
    // Only send a response here if one hasn't been sent yet
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: user._id });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
