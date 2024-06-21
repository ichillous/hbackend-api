const User = require("../models/User");
const Event = require("../models/Event");

exports.search = async (req, res) => {
  try {
    const { query, type } = req.query;
    let results;

    switch (type) {
      case "people":
        results = await User.find({
          role: "user",
          $or: [
            { name: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        }).select("name username profilePicture");
        break;
      case "instructors":
        results = await User.find({
          role: "instructor",
          $or: [
            { name: { $regex: query, $options: "i" } },
            { username: { $regex: query, $options: "i" } },
          ],
        }).select("name username profilePicture");
        break;
      case "institutions":
        results = await User.find({
          role: "institution",
          $or: [
            { name: { $regex: query, $options: "i" } },
            { nonProfitName: { $regex: query, $options: "i" } },
          ],
        }).select("name nonProfitName profilePicture");
        break;
      default:
        return res.status(400).json({ message: "Invalid search type" });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
