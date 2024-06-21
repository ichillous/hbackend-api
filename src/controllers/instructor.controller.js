const User = require('../models/User');
const Group = require('../models/Group');

exports.createClass = async (req, res) => {
  try {
    const instructor = await User.findById(req.user.userId);
    if (instructor.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can create classes' });
    }

    const { name, description, schedule, isPaid, price, maxMembers } = req.body;

    const newClass = new Group({
      name,
      description,
      createdBy: instructor._id,
      schedule,
      isPaid,
      price,
      maxMembers,
      type: 'class'
    });

    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInstructorClasses = async (req, res) => {
  try {
    const classes = await Group.find({ createdBy: req.user.userId, type: 'class' });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const updates = req.body;
    const classObj = await Group.findOne({ _id: classId, createdBy: req.user.userId, type: 'class' });

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found or you do not have permission to update it' });
    }

    Object.keys(updates).forEach((update) => classObj[update] = updates[update]);
    await classObj.save();

    res.json(classObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const result = await Group.findOneAndDelete({ _id: classId, createdBy: req.user.userId, type: 'class' });

    if (!result) {
      return res.status(404).json({ message: 'Class not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassMembers = async (req, res) => {
  try {
    const { classId } = req.params;
    const classObj = await Group.findOne({ _id: classId, createdBy: req.user.userId, type: 'class' })
      .populate('members', 'name email');

    if (!classObj) {
      return res.status(404).json({ message: 'Class not found or you do not have permission to view its members' });
    }

    res.json(classObj.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};