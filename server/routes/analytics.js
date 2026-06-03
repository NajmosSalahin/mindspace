const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const EnergyLog = require('../models/EnergyLog');

// ── GET /api/analytics/overview ───────────────────────────────────────────
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const [tasks, logs] = await Promise.all([
      Task.find({ user: userId, createdAt: { $gte: since } }),
      EnergyLog.find({ user: userId, date: { $gte: since } }).sort({ date: 1 })
    ]);

    const completed = tasks.filter(t => t.status === 'completed');
    const deferred = tasks.filter(t => t.status === 'deferred');

    // Energy type breakdown
    const typeBreakdown = {};
    completed.forEach(t => {
      typeBreakdown[t.energyType] = (typeBreakdown[t.energyType] || 0) + 1;
    });

    // Priority completion rate
    const priorityStats = {};
    ['critical', 'high', 'medium', 'low'].forEach(p => {
      const pTasks = tasks.filter(t => t.priority === p);
      const pDone = pTasks.filter(t => t.status === 'completed');
      priorityStats[p] = {
        total: pTasks.length,
        completed: pDone.length,
        rate: pTasks.length > 0 ? Math.round((pDone.length / pTasks.length) * 100) : 0
      };
    });

    // Daily energy trend
    const energyTrend = logs.map(log => ({
      date: log.date,
      budget: log.budget,
      spent: log.totalSpent,
      recovered: log.totalRecovered,
      score: log.performanceScore,
      tasksCompleted: log.tasksCompleted
    }));

    // Avg cognitive load by day of week
    const dayOfWeekLoad = Array(7).fill(0).map((_, i) => ({ day: i, totalLoad: 0, count: 0 }));
    completed.forEach(t => {
      const day = new Date(t.completedAt).getDay();
      dayOfWeekLoad[day].totalLoad += t.cognitiveLoad;
      dayOfWeekLoad[day].count += 1;
    });
    const weekdayPattern = dayOfWeekLoad.map(d => ({
      ...d,
      avgLoad: d.count > 0 ? Math.round(d.totalLoad / d.count) : 0
    }));

    // Top insight generator
    const insights = [];
    const avgCompletion = completed.length / Math.max(1, parseInt(days));
    if (avgCompletion < 2) insights.push({ type: 'warning', text: 'Your completion rate is low. Consider breaking tasks into smaller chunks.' });
    if (deferred.length > completed.length * 0.5) insights.push({ type: 'danger', text: `You've deferred ${deferred.length} tasks — cognitive debt is accumulating.` });
    if (req.user.cognitiveDebt > 30) insights.push({ type: 'danger', text: 'High cognitive debt detected. Schedule a recovery day.' });
    if (avgCompletion >= 4) insights.push({ type: 'success', text: 'Great completion rate! You\'re managing your mental energy well.' });

    res.json({
      summary: {
        totalTasks: tasks.length,
        completed: completed.length,
        deferred: deferred.length,
        completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
        avgCognitiveLoad: completed.length > 0
          ? Math.round(completed.reduce((s, t) => s + t.cognitiveLoad, 0) / completed.length)
          : 0,
        totalFocusMinutes: completed.reduce((s, t) => s + (t.actualDuration || 0), 0),
        cognitiveDebt: req.user.cognitiveDebt
      },
      typeBreakdown,
      priorityStats,
      energyTrend,
      weekdayPattern,
      insights
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
