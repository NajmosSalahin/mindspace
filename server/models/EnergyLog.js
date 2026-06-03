const mongoose = require('mongoose');

const energyLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // start of day (midnight UTC)

    // Budget snapshot
    budget: { type: Number, required: true },
    startingEnergy: { type: Number, required: true },
    endingEnergy: { type: Number, default: null },
    totalSpent: { type: Number, default: 0 },
    totalRecovered: { type: Number, default: 0 },

    // Hourly energy snapshots for chart rendering
    hourlySnapshots: [
      {
        hour: { type: Number, min: 0, max: 23 },
        energy: { type: Number },
        brainState: { type: String }
      }
    ],

    // Day summary
    tasksCompleted: { type: Number, default: 0 },
    tasksDeferred: { type: Number, default: 0 },
    tasksCancelled: { type: Number, default: 0 },
    totalFocusMinutes: { type: Number, default: 0 },

    // Cognitive debt delta for this day
    debtGenerated: { type: Number, default: 0 },
    debtRecovered: { type: Number, default: 0 },

    // Daily performance score (0-100)
    performanceScore: { type: Number, default: null },

    // Brain state changes throughout the day
    brainStateLog: [
      {
        time: Date,
        state: String
      }
    ]
  },
  { timestamps: true }
);

// ── Virtual: net cognitive debt change ────────────────────────────────────
energyLogSchema.virtual('netDebtChange').get(function () {
  return this.debtGenerated - this.debtRecovered;
});

// ── Method: compute daily performance score ───────────────────────────────
energyLogSchema.methods.computeScore = function () {
  const completionRate =
    this.tasksCompleted /
    Math.max(1, this.tasksCompleted + this.tasksDeferred + this.tasksCancelled);
  const energyEfficiency =
    1 - Math.max(0, (this.totalSpent - this.budget) / this.budget);
  const focusBonus = Math.min(this.totalFocusMinutes / 120, 1) * 0.2;

  this.performanceScore = Math.round(
    (completionRate * 0.5 + energyEfficiency * 0.3 + focusBonus) * 100
  );
  return this.performanceScore;
};

energyLogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('EnergyLog', energyLogSchema);
