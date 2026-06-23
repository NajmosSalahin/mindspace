import crypto from 'crypto';
import mongoose from 'mongoose';
import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';
import Event from '../models/Event.js';
import Waitlist from '../models/Waitlist.js';
import Notification from '../models/Notification.js';
import { sendTicketConfirmationEmail } from '../services/email.js';
import stripe from '../config/stripe.js';

export const purchaseTicket = async (req, res, next) => {
  try {
    const { eventId, tickets, couponCode } = req.body;
    const event = await Event.findById(eventId);
    if (!event || event.isDeleted || event.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Event not found or unavailable' });
    }
    let subtotal = 0;
    const ticketRecords = [];
    for (const item of tickets) {
      const ticketType = event.ticketTypes.find((tt) => tt.name === item.type);
      if (!ticketType) {
        return res.status(400).json({ success: false, message: `Ticket type '${item.type}' not found` });
      }
      if (ticketType.remaining < item.quantity) {
        return res.status(400).json({ success: false, message: `Not enough '${item.type}' tickets remaining` });
      }
      subtotal += ticketType.price * item.quantity;
      for (let i = 0; i < item.quantity; i++) {
        ticketRecords.push({ type: item.type, price: ticketType.price });
      }
    }
    let discount = 0;
    if (couponCode) {
      const Coupon = mongoose.model('Coupon');
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (!coupon || coupon.expiryDate < new Date() || (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses)) {
        return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
      }
      discount = coupon.discountType === 'percent' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
      if (discount > subtotal) discount = subtotal;
      coupon.usedCount += 1;
      await coupon.save();
    }
    const total = Math.max(0, subtotal - discount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { eventId: event._id.toString(), userId: req.user._id.toString() },
    });

    const order = await Order.create({
      userId: req.user._id,
      eventId: event._id,
      tickets: [],
      subtotal,
      discount,
      couponCode: couponCode || '',
      total,
      paymentStatus: 'pending',
      stripePaymentIntentId: paymentIntent.id,
    });

    const createdTickets = [];
    for (const tr of ticketRecords) {
      const qrCode = crypto.randomUUID();
      const ticket = await Ticket.create({
        userId: req.user._id,
        eventId: event._id,
        ticketType: { name: tr.type, price: tr.price },
        qrCode,
        orderId: order._id,
      });
      createdTickets.push(ticket);
      order.tickets.push({ ticketId: ticket._id, type: tr.type, price: tr.price });
      const ticketType = event.ticketTypes.find((tt) => tt.name === tr.type);
      if (ticketType) ticketType.remaining -= 1;
    }
    await order.save();
    await event.save();

    res.json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret, orderId: order._id, tickets: createdTickets },
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('eventId', 'title date venue').populate('userId', 'name email');
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ userId: req.user._id, status: 'active' })
      .populate('eventId', 'title date startTime venue banner city')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket || ticket.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    ticket.status = 'cancelled';
    await ticket.save();
    const event = await Event.findById(ticket.eventId);
    if (event) {
      const tt = event.ticketTypes.find((t) => t.name === ticket.ticketType.name);
      if (tt) tt.remaining += 1;
      await event.save();
    }
    const waitlistEntry = await Waitlist.findOne({ eventId: ticket.eventId, ticketType: ticket.ticketType.name, notified: false }).sort({ createdAt: 1 });
    if (waitlistEntry) {
      waitlistEntry.notified = true;
      await waitlistEntry.save();
      await Notification.create({
        receiverId: waitlistEntry.userId,
        type: 'waitlist_available',
        message: `A ticket slot opened up for ${event?.title}`,
        link: `/events/${ticket.eventId}`,
      });
    }
    res.json({ success: true, message: 'Ticket cancelled' });
  } catch (error) {
    next(error);
  }
};

export const verifyQr = async (req, res, next) => {
  try {
    const { qrCode } = req.body;
    const ticket = await Ticket.findOne({ qrCode }).populate('eventId', 'title');
    if (!ticket) return res.status(404).json({ success: false, message: 'Invalid QR code' });
    if (ticket.checkedIn) return res.status(400).json({ success: false, message: 'Already checked in' });
    ticket.checkedIn = true;
    ticket.checkedInAt = new Date();
    await ticket.save();
    res.json({ success: true, message: 'Check-in successful', data: ticket });
  } catch (error) {
    next(error);
  }
};

export const getCheckInStats = async (req, res, next) => {
  try {
    const total = await Ticket.countDocuments({ eventId: req.params.eventId, status: 'active' });
    const checkedIn = await Ticket.countDocuments({ eventId: req.params.eventId, checkedIn: true });
    res.json({ success: true, data: { total, checkedIn, remaining: total - checkedIn } });
  } catch (error) {
    next(error);
  }
};
