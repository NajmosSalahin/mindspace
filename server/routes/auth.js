const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ── POST /api/auth/register ───────────────────────────────────────────────
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Min 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, password: hashed });

      res.status(201).json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          energyProfile: user.energyProfile,
          brainState: user.brainState,
          cognitiveDebt: user.cognitiveDebt,
          stats: user.stats
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────────────────────
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      user.lastActive = new Date();
      const wasReset = user.checkDailyReset();
      await user.save();

      res.json({
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          energyProfile: user.energyProfile,
          brainState: user.brainState,
          cognitiveDebt: user.cognitiveDebt,
          stats: user.stats,
          preferences: user.preferences,
          energyReset: wasReset
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    energyProfile: req.user.energyProfile,
    brainState: req.user.brainState,
    cognitiveDebt: req.user.cognitiveDebt,
    stats: req.user.stats,
    preferences: req.user.preferences
  });
});

// ── PATCH /api/auth/brain-state ───────────────────────────────────────────
router.patch('/brain-state', auth, async (req, res) => {
  const { brainState } = req.body;
  const valid = ['sharp', 'focused', 'normal', 'tired', 'exhausted'];
  if (!valid.includes(brainState)) {
    return res.status(400).json({ message: 'Invalid brain state' });
  }

  const multipliers = { sharp: 1.15, focused: 1.05, normal: 1.0, tired: 0.75, exhausted: 0.5 };

  req.user.brainState = brainState;
  // Recalculate effective energy cap based on new brain state
  const base = req.user.energyProfile.currentEnergy;
  req.user.energyProfile.currentEnergy = Math.round(base * multipliers[brainState] / (multipliers[req.user.brainState] || 1));
  await req.user.save();

  res.json({ brainState: req.user.brainState, energy: req.user.energyProfile.currentEnergy });
});

module.exports = router;
