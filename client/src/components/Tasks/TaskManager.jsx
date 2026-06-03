import React, { useEffect, useState } from 'react';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';
import TaskCard from './TaskCard.jsx';
import AddTaskModal from './AddTaskModal.jsx';

const STATUS_TABS = [
  { value: '',           label: 'All',       icon: '⬡' },
  { value: 'pending',    label: 'Pending',   icon: '◌' },
  { value: 'in_progress',label: 'Active',    icon: '▶' },
  { value: 'completed',  label: 'Done',      icon: '✓' },
  { value: 'deferred',   label: 'Deferred',  icon: '↻' }
];

const TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'deep_work', label: '🔬 Deep Work' },
  { value: 'creative',  label: '✦ Creative' },
  { value: 'admin',     label: '📋 Admin' },
  { value: 'social',    label: '💬 Social' },
  { value: 'recovery',  label: '🌿 Recovery' }
];

const SORT_OPTIONS = [
  { value: 'smart',   label: '🧠 Smart Sort' },
  { value: 'load_hi', label: '⬆ Load (High→Low)' },
  { value: 'load_lo', label: '⬇ Load (Low→High)' },
  { value: 'priority',label: '🚨 Priority' },
  { value: 'newest',  label: '🕐 Newest First' }
];

function sortTasks(tasks, sortBy) {
  const copy = [...tasks];
  const pw = { critical: 4, high: 3, medium: 2, low: 1 };
  switch (sortBy) {
    case 'load_hi':   return copy.sort((a, b) => b.cognitiveLoad - a.cognitiveLoad);
    case 'load_lo':   return copy.sort((a, b) => a.cognitiveLoad - b.cognitiveLoad);
    case 'priority':  return copy.sort((a, b) => (pw[b.priority] || 0) - (pw[a.priority] || 0));
    case 'newest':    return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    default:          return copy; // smart sort from server
  }
}

export default function TaskManager() {
  const {
    user, tasks, fetchTasks, startTask, completeTask,
    deferTask, deleteTask
  } = useMindSpace();

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('smart');
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const currentEnergy = user?.energyProfile?.currentEnergy ?? 100;

  useEffect(() => {
    fetchTasks({ status: statusFilter || undefined, energyType: typeFilter || undefined, sort: sortBy === 'smart' ? 'smart' : undefined });
  }, [statusFilter, typeFilter]);

  // Apply client-side sort & search
  let displayed = sortTasks(tasks, sortBy);
  if (search.trim()) {
    const q = search.toLowerCase();
    displayed = displayed.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.includes(q))
    );
  }

  const pendingLoad = tasks.filter(t => t.status === 'pending').reduce((s, t) => s + t.cognitiveLoad, 0);
  const completedToday = tasks.filter(t => t.status === 'completed').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }} className="animate-fade-up">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Task <span className="text-gradient">Queue</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            {tasks.length} total · {pendingLoad} units scheduled · {completedToday} completed today
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          + Add Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="glass animate-fade-up" style={{ padding: '14px 18px', marginBottom: 20, animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 14 }}>🔍</span>
            <input
              className="input"
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 36, fontSize: 14 }}
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="input"
            style={{ flex: '0 1 160px', cursor: 'pointer' }}
          >
            {TYPE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input"
            style={{ flex: '0 1 180px', cursor: 'pointer' }}
          >
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }} className="animate-fade-up" style2={{ animationDelay: '0.1s' }}>
        {STATUS_TABS.map(tab => {
          const count = tab.value ? tasks.filter(t => t.status === tab.value).length : tasks.length;
          return (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              style={{
                flex: 1, padding: '9px 12px', border: 'none', borderRadius: 9, cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: statusFilter === tab.value
                  ? 'linear-gradient(135deg, rgba(61,255,143,0.15), rgba(0,212,255,0.1))'
                  : 'transparent',
                color: statusFilter === tab.value ? 'var(--green)' : 'var(--text-2)',
                borderBottom: statusFilter === tab.value ? '1px solid rgba(61,255,143,0.3)' : '1px solid transparent'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span style={{
                fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                background: statusFilter === tab.value ? 'rgba(61,255,143,0.15)' : 'var(--border)',
                color: statusFilter === tab.value ? 'var(--green)' : 'var(--text-3)',
                padding: '1px 6px', borderRadius: 100
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Task list */}
      {displayed.length === 0 ? (
        <div className="glass" style={{ padding: 56, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>
            {search ? '🔍' : statusFilter === 'completed' ? '🏆' : '✨'}
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
            {search ? 'No matches found' : statusFilter === 'completed' ? 'Nothing completed yet' : 'Queue is empty'}
          </h3>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>
            {search ? `Try a different search term.` : 'Add your first task to start managing your cognitive load.'}
          </p>
          {!search && (
            <button onClick={() => setShowAdd(true)} className="btn btn-primary">+ Add Task</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Energy budget summary bar */}
          {statusFilter !== 'completed' && displayed.filter(t => t.status === 'pending').length > 0 && (
            <div className="glass" style={{ padding: '12px 18px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>PENDING LOAD</span>
              <div style={{ flex: 1 }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min(100, (pendingLoad / currentEnergy) * 100)}%`,
                    background: pendingLoad > currentEnergy
                      ? 'linear-gradient(90deg, var(--red), var(--red))'
                      : 'linear-gradient(90deg, var(--green), var(--cyan))',
                    boxShadow: pendingLoad > currentEnergy ? '0 0 8px var(--red-glow)' : '0 0 8px var(--green-glow)'
                  }} />
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                color: pendingLoad > currentEnergy ? 'var(--red)' : 'var(--green)'
              }}>
                {pendingLoad} / {currentEnergy}
                {pendingLoad > currentEnergy && ' ⚠ OVERDRAFT'}
              </span>
            </div>
          )}

          {displayed.map((task, i) => (
            <div key={task._id} className="animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
              <TaskCard
                task={task}
                currentEnergy={currentEnergy}
                onFocus={() => startTask(task._id)}
                onComplete={() => completeTask(task._id)}
                onDefer={() => deferTask(task._id)}
                onDelete={() => deleteTask(task._id)}
              />
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddTaskModal
          onClose={() => { setShowAdd(false); fetchTasks({ status: statusFilter || undefined }); }}
          currentEnergy={currentEnergy}
        />
      )}
    </div>
  );
}
