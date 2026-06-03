const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },

    // ── Cognitive Load Engine ──────────────────────────────────────────────
    cognitiveLoad: { type: Number, required: true, min: 1, max: 100 },

    energyType: {
      type: String,
      enum: ['deep_work', 'creative', 'admin', 'social', 'recovery'],
      required: true
    },

    priority: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium'
    },

    // Estimated vs actual duration (minutes)
    estimatedDuration: { type: Number, required: true },
    actualDuration: { type: Number, default: null },

    // Scheduling
    scheduledFor: { type: Date, default: null },
    optimalTimeSlot: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'anytime'],
      default: 'anytime'
    },
    dueDate: { type: Date, default: null },

    // ── Status Lifecycle ──────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'deferred', 'cancelled'],
      default: 'pending'
    },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    // ── Cognitive Debt System ─────────────────────────────────────────────
    deferCount: { type: Number, default: 0 },
    // Debt increases each time a task is deferred
    cognitiveDebtGenerated: { type: Number, default: 0 },
    // Actual energy consumed (may differ from cognitiveLoad if brain state is poor)
    energyConsumed: { type: Number, default: null },

    // ── Relations ─────────────────────────────────────────────────────────
    tags: [{ type: String, trim: true, lowercase: true }],
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],

    // Focus sessions associated with this task
    focusSessions: [
      {
        startedAt: Date,
        endedAt: Date,
        durationMinutes: Number,
        energyBefore: Number,
        energyAfter: Number,
        completed: Boolean
      }
    ]
  },
  { timestamps: true }
);

// ── Virtual: priority weight for scheduling algorithm ─────────────────────
taskSchema.virtual('priorityWeight').get(function () {
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };
  return weights[this.priority] || 2;
});

// ── Virtual: effective cognitive cost given deferral penalty ──────────────
taskSchema.virtual('effectiveCost').get(function () {
  const deferPenalty = this.deferCount * 0.1; // 10% per deferral
  return Math.min(this.cognitiveLoad * (1 + deferPenalty), 100);
});

// ── Method: compute cognitive debt when deferred ──────────────────────────
taskSchema.methods.defer = function () {
  this.deferCount += 1;
  const debt = this.cognitiveLoad * 0.15 * this.deferCount;
  this.cognitiveDebtGenerated += debt;
  this.status = 'deferred';
  return debt;
};

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
