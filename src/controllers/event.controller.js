const Event = require("../models/Event");
const { paginateResults } = require("../utils/pagination");

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, maxAttendees, isOnline, link } =
      req.body;
    const event = new Event({
      title,
      description,
      date,
      location,
      organizer: req.user.userId,
      maxAttendees,
      isOnline,
      link,
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const { search, startDate, endDate, isOnline, page, limit } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (isOnline) query.isOnline = isOnline === "true";

    const paginatedEvents = await paginateResults(Event, query, page, limit);
    res.json(paginatedEvents);
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
    await event.remove();
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.attendees.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "You have already RSVP'd to this event" });
    }

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res
        .status(400)
        .json({ message: "This event has reached its maximum capacity" });
    }

    event.attendees.push(req.user.userId);
    await event.save();

    res.json({ message: "Successfully RSVP'd to the event" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
