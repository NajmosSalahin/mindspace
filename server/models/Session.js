import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    speaker: { type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, default: '' },
    capacity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

sessionSchema.index({ eventId: 1 });

export default mongoose.model('Session', sessionSchema);
