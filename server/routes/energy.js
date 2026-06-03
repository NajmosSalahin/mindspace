const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EnergyLog = require('../models/EnergyLog');

// ── GET /api/energy ───────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const user = req.user;
  const profile = user.energyProfile;

  const hourOfDay = new Date().getHours();
  let timeMultiplier = 1;
  if (hourOfDay >= 6 && hourOfDay < 12) timeMultiplier = profile.morningMultiplier;
  else if (hourOfDay >= 12 && hourOfDay < 17) timeMultiplier = profile.afternoonMultiplier;
  else timeMultiplier = profile.eveningMultiplier;

  const brainMultipliers = { sharp: 1.2, focused: 1.05, normal: 1.0, tired: 0.75, exhausted: 0.5 };
  const brainMult = brainMultipliers[user.brainState] || 1.0;

  res.json({
    currentEnergy: profile.currentEnergy,
    dailyBudget: profile.dailyBudget,
    percentRemaining: Math.round((profile.currentEnergy / profile.dailyBudget) * 100),
    cognitiveDebt: user.cognitiveDebt,
    brainState: user.brainState,
    effectiveCapacity: Math.round(profile.currentEnergy * brainMult),
    timeMultiplier,
    brainMultiplier: brainMult,
    peakHour: profile.peakHour,
    lastReset: profile.lastReset
  });
});

// ── POST /api/energy/recover ──────────────────────────────────────────────
// Take a break to recover energy
router.post('/recover', auth, async (req, res) => {
  const { minutes = 15 } = req.body;

  const user = req.user;
  const baseRecovery = user.energyProfile.recoveryRate;

  // Longer breaks give diminishing returns
  let recoveryAmount;
  if (minutes <= 5) recoveryAmount = Math.round(baseRecovery * 0.3);
  else if (minutes <= 15) recoveryAmount = Math.round(baseRecovery * 0.7);
  else if (minutes <= 30) recoveryAmount = baseRecovery;
  else recoveryAmount = Math.round(baseRecovery * 1.3); // Power nap bonus

  const before = user.energyProfile.currentEnergy;
  user.energyProfile.currentEnergy = Math.min(
    user.energyProfile.dailyBudget,
    before + recoveryAmount
  );

  // Long breaks also reduce cognitive debt
  if (minutes >= 20) {
    user.cognitiveDebt = Math.max(0, user.cognitiveDebt - Math.round(minutes * 0.5));
  }

  await user.save();

  // Log to energy log
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await EnergyLog.findOneAndUpdate(
    { user: user._id, date: today },
    { $inc: { totalRecovered: recoveryAmount } },
    { upsert: false }
  );

  res.json({
    recoveryAmount,
    energyBefore: before,
    energyAfter: user.energyProfile.currentEnergy,
    cognitiveDebt: user.cognitiveDebt
  });
});

// ── PATCH /api/energy/budget ──────────────────────────────────────────────
router.patch('/budget', auth, async (req, res) => {
  const { dailyBudget, recoveryRate, peakHour } = req.body;

  if (dailyBudget) req.user.energyProfile.dailyBudget = Math.max(50, Math.min(200, dailyBudget));
  if (recoveryRate) req.user.energyProfile.recoveryRate = Math.max(5, Math.min(50, recoveryRate));
  if (peakHour !== undefined) req.user.energyProfile.peakHour = Math.max(0, Math.min(23, peakHour));

  await req.user.save();
  res.json({ energyProfile: req.user.energyProfile });
});

module.exports = router;
