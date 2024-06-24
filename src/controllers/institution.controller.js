const User = require("../models/User");

exports.getNearestMosque = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const mosque = await User.findOne({
      role: "institution",
      organizationType: "mosque",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
        },
      },
    }).select("name address prayerTimes");

    if (!mosque) {
      // If no mosque is found, return default prayer times
      const defaultPrayerTimes = await getPrayerTimes(
        latitude,
        longitude,
        new Date()
      );
      return res.json({
        message: "No mosques found nearby. Showing default prayer times.",
        prayerTimes: defaultPrayerTimes,
      });
    }

    res.json(mosque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateInstitutionProfile = async (req, res) => {
  try {
    const { name, description, address, website, phoneNumber } = req.body;
    const institution = await User.findById(req.user.userId);

    if (!institution || institution.role !== "institution") {
      return res
        .status(403)
        .json({ message: "Only institutions can update their profile" });
    }

    institution.name = name || institution.name;
    institution.description = description || institution.description;
    institution.address = address || institution.address;
    institution.website = website || institution.website;
    institution.phoneNumber = phoneNumber || institution.phoneNumber;

    await institution.save();

    res.json({
      message: "Institution profile updated successfully",
      institution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInstitutionDetails = async (req, res) => {
  try {
    const institution = await User.findById(req.params.id)
      .select("name description address website phoneNumber followers events")
      .populate("followers", "name email")
      .populate("events", "title description startDate");

    if (!institution || institution.role !== "institution") {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.json(institution);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add follower to institution
exports.addFollower = async (req, res) => {
  try {
    const institution = await User.findById(req.params.id);
    const follower = await User.findById(req.user.userId);

    if (!institution || institution.role !== "institution") {
      return res.status(404).json({ message: "Institution not found" });
    }

    if (institution.followers.includes(follower._id)) {
      return res
        .status(400)
        .json({ message: "User is already following this institution" });
    }

    institution.followers.push(follower._id);
    await institution.save();

    res.json({ message: "Successfully followed the institution", institution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove follower from institution
exports.removeFollower = async (req, res) => {
  try {
    const institution = await User.findById(req.params.id);
    const follower = await User.findById(req.user.userId);

    if (!institution || institution.role !== "institution") {
      return res.status(404).json({ message: "Institution not found" });
    }

    if (!institution.followers.includes(follower._id)) {
      return res
        .status(400)
        .json({ message: "User is not following this institution" });
    }

    institution.followers = institution.followers.filter(
      (id) => !id.equals(follower._id)
    );
    await institution.save();

    res.json({
      message: "Successfully unfollowed the institution",
      institution,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get institution followers
exports.getInstitutionFollowers = async (req, res) => {
  try {
    const institution = await User.findById(req.params.id).populate(
      "followers",
      "name email"
    );

    if (!institution || institution.role !== "institution") {
      return res.status(404).json({ message: "Institution not found" });
    }

    res.json(institution.followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePrayerTimes = async (req, res) => {
  try {
    const institution = await User.findById(req.user.userId);
    if (
      !institution ||
      institution.role !== "institution" ||
      institution.organizationType !== "mosque"
    ) {
      return res
        .status(403)
        .json({ message: "Only mosques can update prayer times" });
    }

    institution.prayerTimes = req.body.prayerTimes;
    await institution.save();

    res.json({
      message: "Prayer times updated successfully",
      prayerTimes: institution.prayerTimes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add other institution-specific operations as needed
