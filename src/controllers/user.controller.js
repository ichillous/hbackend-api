const User = require("../models/User");
const languages = require("../config/languages");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLanguages = (req, res) => {
  res.json(languages);
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, location, interests, languages } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (location) user.location = location;
    if (interests) user.interests = interests;
    if (languages) user.languages = languages;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
