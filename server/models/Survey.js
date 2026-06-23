import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    questions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['rating', 'text', 'mcq'], required: true },
        options: [{ type: String }],
      },
    ],
    responses: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        answers: [{ type: mongoose.Schema.Types.Mixed }],
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

surveySchema.index({ eventId: 1 });

export default mongoose.model('Survey', surveySchema);
