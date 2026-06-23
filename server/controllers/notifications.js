import Notification from '../models/Notification.js';
import Ticket from '../models/Ticket.js';
import { getIO } from '../services/socket.js';

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user._id })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ receiverId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ receiverId: req.user._id, isRead: false });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

export const sendAnnouncement = async (req, res, next) => {
  try {
    const { eventId, message } = req.body;
    const tickets = await Ticket.find({ eventId, status: 'active' });
    const notifications = tickets.map((t) => ({
      receiverId: t.userId,
      type: 'announcement',
      message,
      link: `/events/${eventId}`,
    }));
    await Notification.insertMany(notifications);
    const io = getIO();
    tickets.forEach((t) => {
      io.to(`user:${t.userId}`).emit('notification', { type: 'announcement', message, link: `/events/${eventId}` });
    });
    res.json({ success: true, message: 'Announcement sent' });
  } catch (error) {
    next(error);
  }
};
