import React, { useState } from 'react';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';

const ENERGY_TYPES = [
  { value: 'deep_work', icon: '🔬', label: 'Deep Work', desc: 'Research, coding, analysis', color: 'var(--cyan)', loadRange: [50, 90] },
  { value: 'creative',  icon: '✦',  label: 'Creative',  desc: 'Writing, design, ideation', color: 'var(--purple)', loadRange: [40, 80] },
  { value: 'admin',     icon: '📋', label: 'Admin',     desc: 'Email, scheduling, filing', color: 'var(--amber)', loadRange: [10, 40] },
  { value: 'social',    icon: '💬', label: 'Social',    desc: 'Meetings, calls, reviews',  color: 'var(--pink)',  loadRange: [25, 60] },
  { value: 'recovery',  icon: '🌿', label: 'Recovery',  desc: 'Rest, light reading, walks', color: 'var(--teal)', loadRange: [5, 20] }
];

const PRIORITIES = [
  { value: 'critical', label: 'Critical', icon: '🚨', color: 'var(--red)' },
  { value: 'high',     label: 'High',     icon: '🔺', color: 'var(--amber)' },
  { value: 'medium',   label: 'Medium',   icon: '⬡',  color: 'var(--cyan)' },
  { value: 'low',      label: 'Low',      icon: '⬦',  color: 'var(--text-3)' }
];

// Auto-detect load from title keywords
function autoDetectLoad(title, energyType) {
  const text = title.toLowerCase();
  const range = ENERGY_TYPES.find(t => t.value === energyType)?.loadRange || [30, 70];
  let load = Math.round((range[0] + range[1]) / 2);

  if (/review|check|look|quick/.test(text)) load = Math.max(range[0], load - 15);
  if (/complex|deep|research|architect|design|write|build|analyze/.test(text)) load = Math.min(range[1], load + 15);
  if (/urgent|critical|asap|deadline/.test(text)) load = Math.min(range[1], load + 10);

  return Math.max(1, Math.min(100, load));
}

export default function AddTaskModal({ onClose, currentEnergy }) {
  const { createTask } = useMindSpace();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '',
    energyType: 'deep_work',
    cognitiveLoad: 50,
    priority: 'medium',
    estimatedDuration: 30,
    tags: ''
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedType = ENERGY_TYPES.find(t => t.value === form.energyType);

  const steps = [
    { label: 'What',     icon: '✏' },
    { label: 'Type',     icon: '⬡' },
    { label: 'Load',     icon: '⚡' },
    { label: 'Details',  icon: '📋' }
  ];

  const costPct = Math.round((form.cognitiveLoad / currentEnergy) * 100);
  const budgetImpact = costPct > 100 ? 'Exceeds budget!' : costPct > 70 ? 'High impact' : costPct > 40 ? 'Moderate impact' : 'Low impact';
  const impactColor = costPct > 100 ? 'var(--red)' : costPct > 70 ? 'var(--amber)' : 'var(--green)';

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createTask({
        ...form,
        cognitiveLoad: Number(form.cognitiveLoad),
        estimatedDuration: Number(form.estimatedDuration),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return form.title.trim().length >= 2;
    if (step === 1) return !!form.energyType;
    if (step === 2) return form.cognitiveLoad >= 1;
    return true;
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box glass" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>Add Task</h2>
          <button onClick={onClose} className="btn-icon">✕</button>
        </div>

        {/* Progress steps */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 16, left: 16, right: 16, height: 2,
            background: 'var(--border)', zIndex: 0
          }} />
          <div style={{
            position: 'absolute', top: 16, left: 16, height: 2,
            width: `${(step / (steps.length - 1)) * (100 - 32 / steps.length)}%`,
            background: 'linear-gradient(90deg, var(--green), var(--cyan))',
            transition: 'width 0.4s var(--ease-smooth)',
            zIndex: 1
          }} />
          {steps.map((s, i) => (
            <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 2 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `2px solid ${i <= step ? 'var(--green)' : 'var(--border)'}`,
                background: i < step ? 'var(--green)' : i === step ? 'rgba(61,255,143,0.12)' : 'var(--bg-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, color: i < step ? '#04040D' : i === step ? 'var(--green)' : 'var(--text-3)',
                transition: 'all 0.3s', fontWeight: 600
              }}>
                {i < step ? '✓' : s.icon}
              </div>
              <span style={{ fontSize: 11, color: i === step ? 'var(--text-1)' : 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ minHeight: 220, animation: 'fadeIn 0.25s ease' }} key={step}>
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Task Title *</label>
                <input className="input" placeholder="What do you need to accomplish?" value={form.title}
                  onChange={e => {
                    set('title', e.target.value);
                    if (e.target.value.length > 3) set('cognitiveLoad', autoDetectLoad(e.target.value, form.energyType));
                  }}
                  autoFocus style={{ fontSize: 16, padding: '13px 16px' }} />
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea className="input" placeholder="Any additional context or notes..." value={form.description}
                  onChange={e => set('description', e.target.value)} style={{ minHeight: 90 }} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 16 }}>
                What type of mental energy does this task require?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ENERGY_TYPES.map(t => (
                  <button key={t.value} onClick={() => { set('energyType', t.value); set('cognitiveLoad', autoDetectLoad(form.title, t.value)); }}
                    style={{
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      border: `1.5px solid ${form.energyType === t.value ? t.color : 'var(--border)'}`,
                      background: form.energyType === t.value ? `${t.color}12` : 'var(--card-bg)',
                      textAlign: 'left', transition: 'all 0.2s',
                      boxShadow: form.energyType === t.value ? `0 0 20px ${t.color}20` : 'none'
                    }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: form.energyType === t.value ? t.color : 'var(--text-1)', marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label className="label" style={{ margin: 0 }}>Cognitive Load</label>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 28, color: selectedType?.color }}>{form.cognitiveLoad}</span>
                </div>
                <input type="range" min="1" max="100" value={form.cognitiveLoad}
                  onChange={e => set('cognitiveLoad', Number(e.target.value))}
                  style={{ background: `linear-gradient(90deg, ${selectedType?.color} ${form.cognitiveLoad}%, var(--border) ${form.cognitiveLoad}%)` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  <span>1 — Trivial</span><span>50 — Moderate</span><span>100 — Intense</span>
                </div>
              </div>

              {/* Budget impact */}
              <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: `${impactColor}0D`,
                border: `1px solid ${impactColor}30`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Budget Impact</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: impactColor }}>{budgetImpact}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, costPct)}%`, background: impactColor }} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 8 }}>
                  {form.cognitiveLoad} of {currentEnergy} available units ({costPct}%)
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PRIORITIES.map(p => (
                    <button key={p.value} onClick={() => set('priority', p.value)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                        border: `1.5px solid ${form.priority === p.value ? p.color : 'var(--border)'}`,
                        background: form.priority === p.value ? `${p.color}12` : 'var(--card-bg)',
                        color: form.priority === p.value ? p.color : 'var(--text-2)',
                        fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                      }}>
                      <span style={{ fontSize: 16 }}>{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Estimated Duration (minutes)</label>
                <input className="input" type="number" min="5" max="480" value={form.estimatedDuration}
                  onChange={e => set('estimatedDuration', e.target.value)} />
              </div>
              <div>
                <label className="label">Tags (comma-separated)</label>
                <input className="input" placeholder="e.g. client, q4, urgent" value={form.tags}
                  onChange={e => set('tags', e.target.value)} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : onClose()} className="btn btn-ghost">
            {step === 0 ? 'Cancel' : '← Back'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {steps.map((_, i) => (
                <div key={i} style={{ width: i === step ? 16 : 5, height: 5, borderRadius: 100, background: i <= step ? 'var(--green)' : 'var(--border)', transition: 'all 0.3s' }} />
              ))}
            </div>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn btn-primary" disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.4 }}>
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
                {loading ? 'Adding...' : '✓ Add to MindSpace'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
