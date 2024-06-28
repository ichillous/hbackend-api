// src/controllers/admin.controller.js

const User = require('../models/User');
const Group = require('../models/Group');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalInstitutions = await User.countDocuments({ role: 'institution' });
    const totalGroups = await Group.countDocuments();
    
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const recentPayments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('payer', 'name')
      .populate('recipient', 'name');

    const dashboardData = {
      totalUsers,
      totalInstructors,
      totalInstitutions,
      totalGroups,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentPayments,
      timestamp: new Date().getTime()
    };

    console.log('Dashboard data being sent:', dashboardData);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const user = await User.findByIdAndUpdate(userId, { status }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveInstructor = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, 
      { role: 'instructor', verificationStatus: 'verified' }, 
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecentPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('payer', 'name email')
      .populate('recipient', 'name email');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInstructors = async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('-password');
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInstitutions = async (req, res) => {
  try {
    const institutions = await User.find({ role: 'institution' }).select('-password');
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingInstructors = await User.find({ 
      role: 'instructor', 
      verificationStatus: 'pending' 
    }).select('-password');
    
    const pendingInstitutions = await User.find({ 
      role: 'institution', 
      verificationStatus: 'pending' 
    }).select('-password');

    res.json({ pendingInstructors, pendingInstitutions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveInstructor = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, 
      { verificationStatus: 'verified' }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'instructor') {
      return res.status(400).json({ message: 'User is not an instructor' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveInstitution = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findByIdAndUpdate(userId, 
      { verificationStatus: 'verified' }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'institution') {
      return res.status(400).json({ message: 'User is not an institution' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectApproval = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const user = await User.findByIdAndUpdate(userId, 
      { 
        verificationStatus: 'rejected',
        rejectionReason: reason
      }, 
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVerificationDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('name email role verificationDocuments');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;