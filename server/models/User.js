const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },

    energyProfile: {
      dailyBudget: { type: Number, default: 100 },
      morningMultiplier: { type: Number, default: 1.2 },    // 6am-12pm
      afternoonMultiplier: { type: Number, default: 0.85 }, // 12pm-5pm
      eveningMultiplier: { type: Number, default: 0.65 },   // 5pm-10pm
      recoveryRate: { type: Number, default: 25 }, // energy per rest session
      peakHour: { type: Number, default: 9 },      // hour of peak performance
      currentEnergy: { type: Number, default: 100 },
      lastReset: { type: Date, default: Date.now }
    },

    brainState: {
      type: String,
      enum: ['sharp', 'focused', 'normal', 'tired', 'exhausted'],
      default: 'normal'
    },

    // Cognitive debt accumulates when tasks are deferred or energy overdrawn
    cognitiveDebt: { type: Number, default: 0 },

    stats: {
      streak: { type: Number, default: 0 },
      totalTasksCompleted: { type: Number, default: 0 },
      totalFocusMinutes: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      averageDailyCompletion: { type: Number, default: 0 }
    },

    lastActive: { type: Date, default: Date.now },

    preferences: {
      focusSoundscape: {
        type: String,
        enum: ['none', 'rain', 'white_noise', 'forest', 'cafe'],
        default: 'none'
      },
      adaptiveTimer: { type: Boolean, default: true },
      showCognitiveDebt: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

// Reset energy daily
userSchema.methods.checkDailyReset = function () {
  const now = new Date();
  const lastReset = new Date(this.energyProfile.lastReset);
  const isNewDay =
    now.getDate() !== lastReset.getDate() ||
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear();

  if (isNewDay) {
    // Apply cognitive debt penalty to next day's budget
    const debtPenalty = Math.min(this.cognitiveDebt * 0.1, 20);
    this.energyProfile.currentEnergy = Math.max(
      this.energyProfile.dailyBudget - debtPenalty,
      50
    );
    this.energyProfile.lastReset = now;
    this.cognitiveDebt = Math.max(0, this.cognitiveDebt - 5); // Debt recovers slowly
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
