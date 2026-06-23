import User from '../models/User.js';
import Event from '../models/Event.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalEvents, totalOrders, totalRevenue, recentUsers, recentEvents] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Event.countDocuments({ isDeleted: false }),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Event.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).populate('organizerId', 'name'),
    ]);
    res.json({
      success: true,
      data: {
        totalUsers,
        totalEvents,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentUsers,
        recentEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select('-refreshToken'),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, data: users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User suspended' });
  } catch (error) {
    next(error);
  }
};

export const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const filter = { isDeleted: false };
    if (status) filter.status = status;
    if (category) filter.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).populate('organizerId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(filter),
    ]);
    res.json({ success: true, data: events, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    next(error);
  }
};

export const deleteAnyEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

export const featureEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getRevenue = async (req, res, next) => {
  try {
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const total = revenue.reduce((s, r) => s + r.total, 0);
    res.json({ success: true, data: { revenue, total } });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isReported: true }).populate('userId', 'name email').populate('eventId', 'title');
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const approveOrganizer = async (req, res, next) => {
  try {
    const { userId, action } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (action === 'approve') {
      user.role = 'organizer';
      user.organizerRequested = false;
    } else {
      user.organizerRequested = false;
    }
    await user.save();
    res.json({ success: true, message: `Organizer request ${action}d` });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deactivated' });
  } catch (error) {
    next(error);
  }
};
