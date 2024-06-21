const Event = require("../models/Event");
const { paginateResults } = require("../utils/pagination");
const notificationController = require("./notification.controller");

exports.getNearbyEvents = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;
    const events = await Event.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 32186.9, // 20 miles in meters
        },
      },
    })
      .limit(10)
      .populate("organizer", "name");

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.favoriteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (event.favorited_by.includes(user._id)) {
      event.favorited_by = event.favorited_by.filter(
        (id) => id.toString() !== user._id.toString()
      );
    } else {
      event.favorited_by.push(user._id);
    }

    await event.save();
    res.json({
      message: "Event favorite status updated",
      isFavorited: event.favorited_by.includes(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    await notificationController.notifyNewEvent(event._id);

    if (user.role !== "institution") {
      return res
        .status(403)
        .json({ message: "Only institutions can create events" });
    }

    const eventData = {
      ...req.body,
      organizer: req.user.userId,
      location: user.location, // Use the institution's location for the event
    };
    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "date",
      order = "asc",
      type,
      startDate,
      endDate,
    } = req.query;

    const skipIndex = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOption = {};
    sortOption[sort] = order === "desc" ? -1 : 1;

    const events = await Event.find(query)
      .sort(sortOption)
      .limit(Number(limit))
      .skip(skipIndex)
      .populate("organizer", "name");

    const total = await Event.countDocuments(query);

    res.json({
      events,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "organizer",
      "name"
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only update events you organized" });
    }
    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.organizer.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete events you organized" });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.attendEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.attendees.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "You are already attending this event" });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res
        .status(400)
        .json({ message: "This event has reached its maximum capacity" });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    res.json({ message: "Successfully registered for the event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendEventReminders = async () => {
  const upcomingEvents = await Event.find({
    date: {
      $gte: new Date(),
      $lte: new Date(new Date().getTime() + 60 * 60 * 1000),
    },
  });
  for (let event of upcomingEvents) {
    await notificationController.createEventReminder(event._id);
  }
};
