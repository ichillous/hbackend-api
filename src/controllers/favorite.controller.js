const User = require("../models/User");
const Event = require("../models/Event");

exports.toggleFavorite = async (req, res) => {
  try {
    const { type, id } = req.body;
    const user = await User.findById(req.user.userId);

    let field;
    switch (type) {
      case "event":
        field = "favoriteEvents";
        break;
      // ... other cases
    }

    const index = user[field].indexOf(id);
    if (index > -1) {
      user[field].splice(index, 1);
    } else {
      user[field].push(id);
    }

    await user.save();

    if (type === "event") {
      const event = await Event.findById(id);
      event.favoriteCount += index > -1 ? -1 : 1;
      await event.save();
    }

    res.json({
      message: "Favorite updated successfully",
      isFavorited: index === -1,
      favoriteCount: type === "event" ? event.favoriteCount : undefined,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("favoriteEvents", "title date location")
      .populate("favoriteInstructors", "name username")
      .populate("favoriteInstitutions", "name nonProfitName");

    res.json({
      events: user.favoriteEvents,
      instructors: user.favoriteInstructors,
      institutions: user.favoriteInstitutions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
