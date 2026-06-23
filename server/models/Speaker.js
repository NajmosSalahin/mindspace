import mongoose from 'mongoose';

const speakerSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    name: { type: String, required: true },
    designation: { type: String, default: '' },
    bio: { type: String, default: '' },
    image: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  { timestamps: true }
);

speakerSchema.index({ eventId: 1 });

export default mongoose.model('Speaker', speakerSchema);
