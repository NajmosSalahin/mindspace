import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketType: { type: String, required: true },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

waitlistSchema.index({ eventId: 1 });
waitlistSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default mongoose.model('Waitlist', waitlistSchema);
