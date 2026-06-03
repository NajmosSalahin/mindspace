import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';
import EnergyGauge from './EnergyGauge.jsx';
import AddTaskModal from '../Tasks/AddTaskModal.jsx';
import TaskCard from '../Tasks/TaskCard.jsx';

const TYPE_META = {
  deep_work: { icon: '🔬', label: 'Deep Work',  color: 'var(--cyan)',   bg: 'rgba(0,212,255,0.08)' },
  creative:  { icon: '✦',  label: 'Creative',   color: 'var(--purple)', bg: 'rgba(181,123,255,0.08)' },
  admin:     { icon: '📋', label: 'Admin',       color: 'var(--amber)',  bg: 'rgba(255,180,67,0.08)' },
  social:    { icon: '💬', label: 'Social',      color: 'var(--pink)',   bg: 'rgba(255,107,181,0.08)' },
  recovery:  { icon: '🌿', label: 'Recovery',    color: 'var(--teal)',   bg: 'rgba(45,212,191,0.08)' }
};

const BRAIN_LABELS = {
  sharp: { emoji: '⚡', label: 'Sharp', sub: 'Peak cognitive performance', color: 'var(--green)' },
  focused: { emoji: '🎯', label: 'Focused', sub: 'Slightly above normal capacity', color: 'var(--cyan)' },
  normal: { emoji: '🧠', label: 'Normal', sub: 'Standard cognitive capacity', color: 'var(--text-2)' },
  tired: { emoji: '😑', label: 'Tired', sub: '75% capacity — lighter tasks preferred', color: 'var(--amber)' },
  exhausted: { emoji: '💀', label: 'Depleted', sub: '50% capacity — recovery recommended', color: 'var(--red)' }
};

function StatCard({ label, value, sub, color = 'var(--text-1)', delay = 0 }) {
  return (
    <div className="glass animate-fade-up" style={{ padding: '20px 24px', animationDelay: `${delay}s` }}>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, tasks, fetchTasks, fetchEnergy, energy, startTask, completeTask, deferTask, deleteTask } = useMindSpace();
  const [showAdd, setShowAdd] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks({ status: 'pending' });
    fetchEnergy();
  }, []);

  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress');
  const todayCompleted = tasks.filter(t => t.status === 'completed').length;

  const currentEnergy = user?.energyProfile?.currentEnergy ?? 100;
  const dailyBudget = user?.energyProfile?.dailyBudget ?? 100;
  const pct = Math.round((currentEnergy / dailyBudget) * 100);
  const brainInfo = BRAIN_LABELS[user?.brainState] || BRAIN_LABELS.normal;

  const scheduledLoad = pendingTasks.reduce((sum, t) => sum + t.cognitiveLoad, 0);
  const wouldOverdraw = scheduledLoad > currentEnergy;

  // Projected depletion time
  const getProjectedDepletion = () => {
    if (scheduledLoad === 0) return 'No tasks scheduled';
    if (scheduledLoad <= currentEnergy) return 'Energy sufficient for all tasks';
    return `${Math.round(((currentEnergy / scheduledLoad) * 100))}% of tasks completable`;
  };

  const handleFocus = async (task) => {
    await startTask(task._id);
  };

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {' — '}
          {brainInfo.emoji} {brainInfo.label}: {brainInfo.sub}
        </p>
      </div>

      {/* Top row: Gauge + Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 24 }}>
        {/* Energy card */}
        <div className="glass animate-fade-up" style={{
          padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center',
          borderColor: pct > 60 ? 'rgba(61,255,143,0.15)' : pct > 30 ? 'rgba(255,180,67,0.15)' : 'rgba(255,75,110,0.2)',
          boxShadow: pct <= 30 ? '0 0 40px rgba(255,75,110,0.08)' : '0 0 40px rgba(61,255,143,0.05)'
        }}>
          <EnergyGauge energy={currentEnergy} budget={dailyBudget} size={200} />
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Cognitive Budget</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{getProjectedDepletion()}</div>
          </div>
          {wouldOverdraw && (
            <div style={{
              marginTop: 12, padding: '8px 14px',
              background: 'rgba(255,75,110,0.1)', border: '1px solid rgba(255,75,110,0.25)',
              borderRadius: 8, fontSize: 12, color: 'var(--red)', textAlign: 'center'
            }}>
              ⚠ Scheduled load ({scheduledLoad}) exceeds budget
            </div>
          )}
        </div>

        {/* Stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 14 }}>
          <StatCard
            label="Scheduled Load"
            value={scheduledLoad}
            sub={`of ${currentEnergy} available units`}
            color={wouldOverdraw ? 'var(--red)' : 'var(--text-1)'}
            delay={0.05}
          />
          <StatCard label="Completed Today" value={todayCompleted} sub="tasks finished" color="var(--green)" delay={0.1} />
          <StatCard label="Pending Tasks" value={pendingTasks.length} sub="awaiting attention" delay={0.15} />
          <StatCard
            label="Cognitive Debt"
            value={`${Math.round(user?.cognitiveDebt ?? 0)}`}
            sub="accumulated deferral cost"
            color={(user?.cognitiveDebt ?? 0) > 20 ? 'var(--red)' : 'var(--text-1)'}
            delay={0.2}
          />
        </div>
      </div>

      {/* Type breakdown */}
      <div className="glass animate-fade-up" style={{ padding: '18px 24px', marginBottom: 24, animationDelay: '0.15s' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Energy Type Allocation</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const count = pendingTasks.filter(t => t.energyType === type).length;
            const load = pendingTasks.filter(t => t.energyType === type).reduce((s, t) => s + t.cognitiveLoad, 0);
            return (
              <div key={type} style={{
                padding: '8px 14px', borderRadius: 10,
                background: meta.bg,
                border: `1px solid ${meta.color}30`,
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span>{meta.icon}</span>
                <div>
                  <div style={{ fontSize: 12, color: meta.color, fontWeight: 600 }}>{meta.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    {count} task{count !== 1 ? 's' : ''} · {load} units
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task queue */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.01em' }}>
          Today's Queue <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: 15 }}>({pendingTasks.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/tasks')} className="btn btn-ghost" style={{ fontSize: 13 }}>View all</button>
          <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ fontSize: 13 }}>+ Add task</button>
        </div>
      </div>

      {pendingTasks.length === 0 ? (
        <div className="glass animate-fade-up" style={{
          padding: 48, textAlign: 'center',
          animationDelay: '0.2s'
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>All clear!</h3>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>No pending tasks. Add something or take a break to recover energy.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pendingTasks.slice(0, 6).map((task, i) => (
            <div key={task._id} className="animate-fade-up" style={{ animationDelay: `${0.2 + i * 0.05}s` }}>
              <TaskCard
                task={task}
                currentEnergy={currentEnergy}
                onFocus={() => handleFocus(task)}
                onComplete={() => completeTask(task._id)}
                onDefer={() => deferTask(task._id)}
                onDelete={() => deleteTask(task._id)}
              />
            </div>
          ))}
          {pendingTasks.length > 6 && (
            <button onClick={() => navigate('/tasks')} className="btn btn-ghost" style={{ alignSelf: 'center', marginTop: 4 }}>
              View {pendingTasks.length - 6} more tasks
            </button>
          )}
        </div>
      )}

      {showAdd && <AddTaskModal onClose={() => setShowAdd(false)} currentEnergy={currentEnergy} />}
    </div>
  );
}
