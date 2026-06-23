import User from '../models/User.js';
import Event from '../models/Event.js';
import { uploadImage } from '../services/cloudinary.js';
import Notification from '../models/Notification.js';

export const getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'bio', 'phone', 'socialLinks'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.file) {
      const result = await uploadImage(req.file, 'profiles');
      updates.profileImage = result.url;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (req.user.following.includes(targetUser._id)) {
      return res.status(400).json({ success: false, message: 'Already following' });
    }
    req.user.following.push(targetUser._id);
    await req.user.save();
    res.json({ success: true, message: 'Now following' });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    req.user.following = req.user.following.filter((id) => id.toString() !== req.params.id);
    await req.user.save();
    res.json({ success: true, message: 'Unfollowed' });
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (req.user.favorites.includes(event._id)) {
      return res.status(400).json({ success: false, message: 'Already in favorites' });
    }
    req.user.favorites.push(event._id);
    await req.user.save();
    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    req.user.favorites = req.user.favorites.filter((id) => id.toString() !== req.params.eventId);
    await req.user.save();
    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getOrganizers = async (req, res, next) => {
  try {
    const organizers = await User.find({ role: 'organizer', isActive: true })
      .select('name email profileImage bio')
      .sort({ name: 1 });
    res.json({ success: true, data: organizers });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('following', 'name profileImage role');
    res.json({ success: true, data: user.following });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json({ success: true, data: user.favorites });
  } catch (error) {
    next(error);
  }
};

export const getUserEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizerId: req.params.id, isDeleted: false }).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const requestOrganizer = async (req, res, next) => {
  try {
    req.user.organizerRequested = true;
    await req.user.save();
    await Notification.create({
      type: 'announcement',
      message: `${req.user.name} has requested organizer role`,
      link: '/admin/organizers',
    });
    res.json({ success: true, message: 'Organizer request submitted' });
  } catch (error) {
    next(error);
  }
};
