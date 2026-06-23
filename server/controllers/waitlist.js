import Waitlist from '../models/Waitlist.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';

export const joinWaitlist = async (req, res, next) => {
  try {
    const { eventId, ticketType } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const existing = await Waitlist.findOne({ userId: req.user._id, eventId });
    if (existing) return res.status(400).json({ success: false, message: 'Already on waitlist' });
    const entry = await Waitlist.create({ userId: req.user._id, eventId, ticketType });
    const position = await Waitlist.countDocuments({ eventId, ticketType, createdAt: { $lte: entry.createdAt } });
    res.status(201).json({ success: true, data: { ...entry.toObject(), position } });
  } catch (error) {
    next(error);
  }
};

export const getWaitlist = async (req, res, next) => {
  try {
    const entries = await Waitlist.find({ eventId: req.params.eventId })
      .populate('userId', 'name email')
      .sort({ createdAt: 1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    next(error);
  }
};

export const leaveWaitlist = async (req, res, next) => {
  try {
    const entry = await Waitlist.findOneAndDelete({ userId: req.user._id, eventId: req.params.eventId });
    if (!entry) return res.status(404).json({ success: false, message: 'Not on waitlist' });
    res.json({ success: true, message: 'Removed from waitlist' });
  } catch (error) {
    next(error);
  }
};

export const notifyNext = async (req, res, next) => {
  try {
    const { eventId, ticketType } = req.body;
    const entry = await Waitlist.findOne({ eventId, ticketType, notified: false }).sort({ createdAt: 1 });
    if (!entry) return res.json({ success: true, message: 'No one on waitlist' });
    entry.notified = true;
    await entry.save();
    await Notification.create({
      receiverId: entry.userId,
      type: 'waitlist_available',
      message: 'A ticket is now available!',
      link: `/events/${eventId}`,
    });
    res.json({ success: true, message: 'Next person notified' });
  } catch (error) {
    next(error);
  }
};
