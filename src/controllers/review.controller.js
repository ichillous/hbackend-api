const Review = require('../models/Review');
const Group = require('../models/Group');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16', // Use the latest API version
  maxNetworkRetries: 2,
  timeout: 20000, // in milliseconds
});

exports.createReview = async (req, res) => {
  try {
    const { groupId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Check if the group exists and is a class
    const group = await Group.findById(groupId);
    if (!group || group.type !== 'class') {
      return res.status(400).json({ message: 'Invalid group or not a class' });
    }

    // Check if user has already reviewed this class
    const existingReview = await Review.findOne({ user: userId, group: groupId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this class' });
    }

    const review = new Review({
      user: userId,
      group: groupId,
      rating,
      comment
    });

    await review.save();

    // Update the group's average rating
    const reviews = await Review.find({ group: groupId });
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    group.averageRating = avgRating;
    await group.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getGroupReviews = async (req, res) => {
  try {
    const { groupId } = req.params;
    const reviews = await Review.find({ group: groupId })
      .populate('user', 'name')
      .sort('-createdAt');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};