import React, { useState } from 'react';

const TYPE_META = {
  deep_work: { icon: '🔬', label: 'Deep Work',  color: 'var(--cyan)',   bg: 'rgba(0,212,255,0.07)' },
  creative:  { icon: '✦',  label: 'Creative',   color: 'var(--purple)', bg: 'rgba(181,123,255,0.07)' },
  admin:     { icon: '📋', label: 'Admin',       color: 'var(--amber)',  bg: 'rgba(255,180,67,0.07)' },
  social:    { icon: '💬', label: 'Social',      color: 'var(--pink)',   bg: 'rgba(255,107,181,0.07)' },
  recovery:  { icon: '🌿', label: 'Recovery',    color: 'var(--teal)',   bg: 'rgba(45,212,191,0.07)' }
};

function LoadBar({ value, max = 100, color }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{
          width: `${pct}%`,
          background: color,
          boxShadow: `0 0 6px ${color}60`
        }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', width: 28, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function TaskCard({ task, currentEnergy, onFocus, onComplete, onDefer, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(null); // 'delete' | 'defer'

  const meta = TYPE_META[task.energyType] || TYPE_META.admin;
  const canAfford = task.cognitiveLoad <= currentEnergy;
  const effectiveCost = task.effectiveCost || task.cognitiveLoad;
  const isInProgress = task.status === 'in_progress';

  const priorityColors = {
    critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--cyan)', low: 'var(--text-3)'
  };

  return (
    <div
      className="glass"
      style={{
        padding: '16px 20px',
        borderLeft: `3px solid ${meta.color}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isInProgress ? `${meta.bg}` : 'var(--card-bg)',
        boxShadow: isInProgress ? `0 0 20px ${meta.color}20` : undefined
      }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Type icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: meta.bg, border: `1px solid ${meta.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
        }}>
          {meta.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{task.title}</span>
            <span className={`badge badge-${task.priority}`}>{task.priority}</span>
            {isInProgress && (
              <span style={{ fontSize: 11, color: meta.color, fontFamily: 'var(--font-mono)', background: meta.bg, padding: '2px 8px', borderRadius: 100, border: `1px solid ${meta.color}30` }}>
                IN PROGRESS
              </span>
            )}
            {task.deferCount > 0 && (
              <span style={{ fontSize: 11, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                ↻ {task.deferCount}x deferred
              </span>
            )}
          </div>

          {/* Cognitive load bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>COGNITIVE LOAD</span>
              {!canAfford && (
                <span style={{ fontSize: 11, color: 'var(--red)' }}>⚠ Exceeds energy</span>
              )}
            </div>
            <LoadBar value={effectiveCost} color={canAfford ? meta.color : 'var(--red)'} />
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
              ⏱ {task.estimatedDuration} min
            </span>
            <span style={{ fontSize: 12, color: meta.color }}>
              {meta.icon} {meta.label}
            </span>
            {task.contextSwitchPenalty > 0 && (
              <span style={{ fontSize: 12, color: 'var(--amber)' }}>
                +{task.contextSwitchPenalty} switch cost
              </span>
            )}
            {task.optimalTimeSlot !== 'anytime' && (
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                🕐 Best: {task.optimalTimeSlot}
              </span>
            )}
          </div>
        </div>

        {/* Quick complete */}
        <button
          onClick={e => { e.stopPropagation(); onComplete(); }}
          style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
            transition: 'all 0.2s', color: 'var(--text-3)'
          }}
          title="Mark complete"
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(61,255,143,0.12)'; e.currentTarget.style.borderColor = 'rgba(61,255,143,0.4)'; e.currentTarget.style.color = 'var(--green)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)'; }}
        >
          ✓
        </button>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.2s ease' }}>
          {task.description && (
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14, lineHeight: 1.6 }}>{task.description}</p>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={e => { e.stopPropagation(); onFocus(); }}
              className="btn btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>
              ▶ Start Focus
            </button>
            <button onClick={e => { e.stopPropagation(); onDefer(); }}
              className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 14px' }}>
              ↻ Defer
              {task.deferCount > 0 && <span style={{ color: 'var(--amber)', fontSize: 11 }}> (+debt)</span>}
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(); }}
              className="btn btn-danger" style={{ fontSize: 13, padding: '8px 14px' }}>
              ✕ Remove
            </button>
          </div>

          {task.tags?.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {task.tags.map(tag => (
                <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 100, background: 'var(--border)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
