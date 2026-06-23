import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    organizerResponse: { type: String, default: '' },
    helpfulCount: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ eventId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
