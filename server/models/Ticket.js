import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketType: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
    },
    qrCode: { type: String, unique: true },
    qrImage: { type: String, default: '' },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'refunded'],
      default: 'active',
    },
  },
  { timestamps: true }
);

ticketSchema.index({ userId: 1 });
ticketSchema.index({ eventId: 1 });
ticketSchema.index({ orderId: 1 });

export default mongoose.model('Ticket', ticketSchema);
