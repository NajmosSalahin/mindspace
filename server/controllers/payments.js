import stripe from '../config/stripe.js';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import { sendTicketConfirmationEmail } from '../services/email.js';

export const createPaymentIntent = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'usd',
      metadata: { orderId: order._id.toString(), userId: req.user._id.toString(), eventId: order.eventId.toString() },
    });
    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();
    res.json({ success: true, data: { clientSecret: paymentIntent.client_secret } });
  } catch (error) {
    next(error);
  }
};

export const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.paymentStatus = 'paid';
    await order.save();
    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      amount: order.total,
      stripeTransactionId: paymentIntentId,
      status: 'completed',
    });
    res.json({ success: true, message: 'Payment confirmed' });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).populate('orderId').sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const refund = await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
    order.paymentStatus = 'refunded';
    await order.save();
    await Ticket.updateMany({ orderId: order._id }, { status: 'refunded' });
    await Payment.findOneAndUpdate({ orderId: order._id }, { status: 'refunded' });
    res.json({ success: true, message: 'Payment refunded', data: refund });
  } catch (error) {
    next(error);
  }
};

export const handleStripeWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        await order.save();
        await Payment.create({
          orderId: order._id,
          userId: order.userId,
          amount: order.total,
          stripeTransactionId: paymentIntent.id,
          status: 'completed',
        });
        const eventDoc = await Event.findById(order.eventId);
        const user = await (await import('../models/User.js')).default.findById(order.userId);
        if (user && eventDoc) {
          const tickets = await Ticket.find({ orderId: order._id });
          for (const ticket of tickets) {
            await sendTicketConfirmationEmail(user.email, user.name, eventDoc.title, ticket.qrCode);
          }
        }
        const Notification = (await import('../models/Notification.js')).default;
        if (eventDoc) {
          await Notification.create({
            receiverId: eventDoc.organizerId,
            type: 'ticket_purchased',
            message: `New ticket purchase for ${eventDoc.title}`,
            link: `/organizer/events/${eventDoc._id}/attendees`,
          });
        }
      }
    }
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};
