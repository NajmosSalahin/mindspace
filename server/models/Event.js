import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['Tech', 'Music', 'Sports', 'Business', 'Education', 'Gaming', 'Workshop', 'Other'],
      required: true,
    },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venue: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    banner: { type: String, default: '' },
    images: [{ type: String }],
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    ticketTypes: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 0 },
        remaining: { type: Number, required: true, min: 0 },
        description: { type: String, default: '' },
      },
    ],
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Session' }],
    speakers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speaker' }],
    isFeatured: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ city: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ isFeatured: 1, status: 1 });

export default mongoose.model('Event', eventSchema);
