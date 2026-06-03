const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const EnergyLog = require('../models/EnergyLog');
const auth = require('../middleware/auth');

// ── COGNITIVE SCHEDULING ENGINE ───────────────────────────────────────────
function getOptimalSlot(cognitiveLoad, energyType) {
  if (energyType === 'recovery') return 'evening';
  if (cognitiveLoad >= 70) return 'morning';
  if (cognitiveLoad >= 40) return 'afternoon';
  return 'anytime';
}

function getBrainStateMultiplier(brainState) {
  return { sharp: 1.2, focused: 1.05, normal: 1.0, tired: 0.75, exhausted: 0.5 }[brainState] || 1.0;
}

function getContextSwitchPenalty(lastType, currentType) {
  if (!lastType || lastType === currentType) return 0;
  const highCostSwitches = [
    ['deep_work', 'social'], ['creative', 'admin'], ['deep_work', 'admin']
  ];
  const isHighCost = highCostSwitches.some(
    ([a, b]) => (lastType === a && currentType === b) || (lastType === b && currentType === a)
  );
  return isHighCost ? 15 : 8;
}

// Smart sort: high-load tasks first, but interleave to prevent burnout
function smartSort(tasks, brainState) {
  const multiplier = getBrainStateMultiplier(brainState);
  return [...tasks].sort((a, b) => {
    const aScore = (a.cognitiveLoad * a.priorityWeight) * multiplier;
    const bScore = (b.cognitiveLoad * b.priorityWeight) * multiplier;
    // Critical always first
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
    return bScore - aScore;
  });
}

async function logEnergySnapshot(userId, energyConsumed, taskStatus) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let log = await EnergyLog.findOne({ user: userId, date: today });
  if (!log) {
    const user = await User.findById(userId);
    log = new EnergyLog({
      user: userId,
      date: today,
      budget: user.energyProfile.dailyBudget,
      startingEnergy: user.energyProfile.dailyBudget
    });
  }

  if (taskStatus === 'completed') {
    log.tasksCompleted += 1;
    log.totalSpent += energyConsumed;
  } else if (taskStatus === 'deferred') {
    log.tasksDeferred += 1;
  }

  const hour = new Date().getHours();
  const user = await User.findById(userId);
  log.hourlySnapshots.push({ hour, energy: user.energyProfile.currentEnergy, brainState: user.brainState });

  await log.save();
}

// ── GET /api/tasks ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { status, energyType, sort = 'smart' } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (energyType) filter.energyType = energyType;

    let tasks = await Task.find(filter).sort({ createdAt: -1 });

    // Apply smart sort if requested
    if (sort === 'smart') {
      const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
      const done = tasks.filter(t => !['pending', 'in_progress'].includes(t.status));
      tasks = [...smartSort(pending, req.user.brainState), ...done];
    }

    // Attach context-switch penalties
    let lastType = null;
    const enriched = tasks.map(task => {
      const penalty = getContextSwitchPenalty(lastType, task.energyType);
      if (task.status === 'pending' || task.status === 'in_progress') lastType = task.energyType;
      return { ...task.toJSON(), contextSwitchPenalty: penalty };
    });

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────
router.post(
  '/',
  auth,
  [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('cognitiveLoad').isInt({ min: 1, max: 100 }),
    body('energyType').isIn(['deep_work', 'creative', 'admin', 'social', 'recovery']),
    body('estimatedDuration').isInt({ min: 1 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, cognitiveLoad, energyType, priority, estimatedDuration, scheduledFor, dueDate, tags } = req.body;

    try {
      // Check if this task would overdraw energy budget
      const remaining = req.user.energyProfile.currentEnergy;
      const willOverdraw = cognitiveLoad > remaining;

      const task = await Task.create({
        user: req.user._id,
        title,
        description,
        cognitiveLoad,
        energyType,
        priority: priority || 'medium',
        estimatedDuration,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        optimalTimeSlot: getOptimalSlot(cognitiveLoad, energyType),
        tags: tags || []
      });

      res.status(201).json({ task: task.toJSON(), willOverdraw, remainingEnergy: remaining });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────
router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowed = ['title', 'description', 'cognitiveLoad', 'energyType', 'priority', 'estimatedDuration', 'scheduledFor', 'dueDate', 'tags'];
    allowed.forEach(field => { if (req.body[field] !== undefined) task[field] = req.body[field]; });

    task.optimalTimeSlot = getOptimalSlot(task.cognitiveLoad, task.energyType);
    await task.save();

    res.json(task.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/tasks/:id/start ─────────────────────────────────────────────
router.post('/:id/start', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = 'in_progress';
    task.startedAt = new Date();
    task.focusSessions.push({ startedAt: new Date(), energyBefore: req.user.energyProfile.currentEnergy });
    await task.save();

    res.json(task.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/tasks/:id/complete ──────────────────────────────────────────
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { actualDuration } = req.body;
    const brainMultiplier = getBrainStateMultiplier(req.user.brainState);
    const energyConsumed = Math.round(task.cognitiveLoad * (1 / brainMultiplier));

    task.status = 'completed';
    task.completedAt = new Date();
    task.actualDuration = actualDuration || task.estimatedDuration;
    task.energyConsumed = energyConsumed;

    // Close active focus session
    const lastSession = task.focusSessions[task.focusSessions.length - 1];
    if (lastSession && !lastSession.endedAt) {
      lastSession.endedAt = new Date();
      lastSession.completed = true;
      lastSession.durationMinutes = task.actualDuration;
      lastSession.energyAfter = Math.max(0, req.user.energyProfile.currentEnergy - energyConsumed);
    }

    await task.save();

    // Deduct energy from user
    req.user.energyProfile.currentEnergy = Math.max(0, req.user.energyProfile.currentEnergy - energyConsumed);
    req.user.stats.totalTasksCompleted += 1;
    req.user.stats.totalFocusMinutes += task.actualDuration;
    await req.user.save();

    await logEnergySnapshot(req.user._id, energyConsumed, 'completed');

    res.json({
      task: task.toJSON(),
      energyConsumed,
      remainingEnergy: req.user.energyProfile.currentEnergy
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/tasks/:id/defer ─────────────────────────────────────────────
router.post('/:id/defer', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const debtGenerated = task.defer(); // increments deferCount, sets status
    await task.save();

    // Add cognitive debt to user
    req.user.cognitiveDebt += debtGenerated;
    await req.user.save();

    await logEnergySnapshot(req.user._id, 0, 'deferred');

    res.json({ task: task.toJSON(), debtGenerated, totalDebt: req.user.cognitiveDebt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
