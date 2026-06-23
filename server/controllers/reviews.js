import Review from '../models/Review.js';
import Ticket from '../models/Ticket.js';

export const createReview = async (req, res, next) => {
  try {
    const { eventId, rating, comment } = req.body;
    const existing = await Review.findOne({ userId: req.user._id, eventId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this event' });
    }
    const ticket = await Ticket.findOne({ userId: req.user._id, eventId, status: 'active' });
    if (!ticket) {
      return res.status(400).json({ success: false, message: 'You must attend the event to review' });
    }
    const review = await Review.create({
      userId: req.user._id,
      eventId,
      rating,
      comment,
      isVerified: ticket.checkedIn,
    });
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ eventId: req.params.id })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 });
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((r) => { distribution[r.rating - 1] += 1; });
    res.json({ success: true, data: { reviews, stats: { total, average, distribution } } });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || review.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment) review.comment = req.body.comment;
    await review.save();
    res.json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

export const reportReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isReported: true }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review reported' });
  } catch (error) {
    next(error);
  }
};
