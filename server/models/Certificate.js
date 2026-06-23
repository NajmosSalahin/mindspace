import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    certificateUrl: { type: String, default: '' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ userId: 1 });
certificateSchema.index({ eventId: 1 });

export default mongoose.model('Certificate', certificateSchema);
