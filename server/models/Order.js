import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    tickets: [
      {
        ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
        type: { type: String },
        price: { type: Number },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ eventId: 1 });
orderSchema.index({ stripePaymentIntentId: 1 });

export default mongoose.model('Order', orderSchema);
