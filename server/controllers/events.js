import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Session from '../models/Session.js';
import Speaker from '../models/Speaker.js';
import Review from '../models/Review.js';
import { uploadImage } from '../services/cloudinary.js';

export const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body, organizerId: req.user._id };
    if (req.files?.banner) {
      const result = await uploadImage(req.files.banner[0], 'events');
      eventData.banner = result.url;
    }
    if (req.files?.images) {
      const results = await Promise.all(req.files.images.map((f) => uploadImage(f, 'events')));
      eventData.images = results.map((r) => r.url);
    }
    eventData.ticketTypes = JSON.parse(req.body.ticketTypes || '[]');
    eventData.tags = JSON.parse(req.body.tags || '[]');
    eventData.ticketTypes = eventData.ticketTypes.map((tt) => ({ ...tt, remaining: tt.quantity }));
    const event = await Event.create(eventData);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 12, category, priceMin, priceMax,
      city, dateFrom, dateTo, rating, status, search, sort, organizer,
    } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = { $in: category.split(',') };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (status) filter.status = status;
    else filter.status = { $ne: 'draft' };
    if (organizer === 'me') {
      if (req.user) filter.organizerId = req.user._id;
    } else if (organizer) {
      filter.organizerId = organizer;
    }
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    let sortOption = { date: 1 };
    if (sort === 'popular') sortOption = { viewCount: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'price-asc') sortOption = { 'ticketTypes.0.price': 1 };
    else if (sort === 'price-desc') sortOption = { 'ticketTypes.0.price': -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).populate('organizerId', 'name profileImage').sort(sortOption).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerId', 'name email profileImage bio')
      .populate('sessions')
      .populate('speakers');
    if (!event || event.isDeleted) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    event.viewCount += 1;
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.isDeleted) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    Object.assign(event, req.body);
    if (req.files?.banner) {
      const result = await uploadImage(req.files.banner[0], 'events');
      event.banner = result.url;
    }
    if (req.body.ticketTypes) event.ticketTypes = JSON.parse(req.body.ticketTypes);
    if (req.body.tags) event.tags = JSON.parse(req.body.tags);
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || event.isDeleted) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    event.isDeleted = true;
    await event.save();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};

export const getTrendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'published', isDeleted: false })
      .sort({ viewCount: -1, createdAt: -1 })
      .limit(10)
      .populate('organizerId', 'name profileImage');
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ isFeatured: true, status: 'published', isDeleted: false })
      .populate('organizerId', 'name profileImage');
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const getEventSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({ eventId: req.params.id }).populate('speaker');
    res.json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const getEventSpeakers = async (req, res, next) => {
  try {
    const speakers = await Speaker.find({ eventId: req.params.id });
    res.json({ success: true, data: speakers });
  } catch (error) {
    next(error);
  }
};

export const getEventReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ eventId: req.params.id }).populate('userId', 'name profileImage').sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

export const toggleWishlist = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const idx = req.user.favorites.findIndex((id) => id.toString() === eventId);
    if (idx > -1) {
      req.user.favorites.splice(idx, 1);
      await req.user.save();
      return res.json({ success: true, message: 'Removed from wishlist', isFavorited: false });
    }
    req.user.favorites.push(eventId);
    await req.user.save();
    res.json({ success: true, message: 'Added to wishlist', isFavorited: true });
  } catch (error) {
    next(error);
  }
};

export const getEventsByCategory = async (req, res, next) => {
  try {
    const events = await Event.find({ category: req.params.slug, status: 'published', isDeleted: false })
      .populate('organizerId', 'name profileImage');
    res.json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    event.status = req.body.status;
    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getEventAttendees = async (req, res, next) => {
  try {
    const Ticket = mongoose.model('Ticket');
    const attendees = await Ticket.find({ eventId: req.params.id, status: 'active' })
      .populate('userId', 'name email profileImage');
    res.json({ success: true, data: attendees });
  } catch (error) {
    next(error);
  }
};

export const getEventAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const Ticket = mongoose.model('Ticket');
    const Order = mongoose.model('Order');
    const totalTickets = await Ticket.countDocuments({ eventId: event._id, status: 'active' });
    const checkedIn = await Ticket.countDocuments({ eventId: event._id, checkedIn: true });
    const orders = await Order.find({ eventId: event._id, paymentStatus: 'paid' });
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    res.json({
      success: true,
      data: {
        totalTickets,
        checkedIn,
        totalRevenue,
        capacity: event.capacity,
        attendanceRate: event.capacity > 0 ? (checkedIn / event.capacity) * 100 : 0,
        viewCount: event.viewCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
