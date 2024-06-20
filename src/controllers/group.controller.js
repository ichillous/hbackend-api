const Group = require("../models/Group");

exports.createGroup = async (req, res) => {
  try {
    const { name, description, isPaid, price, schedule, type } = req.body;
    const group = new Group({
      name,
      description,
      createdBy: req.user.userId,
      isPaid,
      price,
      schedule,
      type,
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.members.includes(req.user.userId)) {
      return res
        .status(400)
        .json({ message: "You are already a member of this group" });
    }

    group.members.push(req.user.userId);
    await group.save();

    res.json({ message: "Successfully joined the group" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const { search, type, isPaid, page, limit } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type) query.type = type;
    if (isPaid) query.isPaid = isPaid === "true";

    const paginatedGroups = await paginateResults(Group, query, page, limit);
    res.json(paginatedGroups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "createdBy",
      "name"
    );
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only update groups you created" });
    }
    Object.assign(group, req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (group.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "You can only delete groups you created" });
    }
    await group.remove();
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
