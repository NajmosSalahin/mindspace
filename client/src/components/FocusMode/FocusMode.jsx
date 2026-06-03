import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';

const TYPE_META = {
  deep_work: { icon: '🔬', color: 'var(--cyan)',   glow: 'rgba(0,212,255,0.3)' },
  creative:  { icon: '✦',  color: 'var(--purple)', glow: 'rgba(181,123,255,0.3)' },
  admin:     { icon: '📋', color: 'var(--amber)',  glow: 'rgba(255,180,67,0.3)' },
  social:    { icon: '💬', color: 'var(--pink)',   glow: 'rgba(255,107,181,0.3)' },
  recovery:  { icon: '🌿', color: 'var(--teal)',   glow: 'rgba(45,212,191,0.3)' }
};

// Adaptive Pomodoro: higher load = shorter session
function getSessionMinutes(cognitiveLoad, brainState) {
  const brainAdj = { sharp: 1.2, focused: 1.1, normal: 1.0, tired: 0.8, exhausted: 0.6 };
  const adj = brainAdj[brainState] || 1.0;
  if (cognitiveLoad >= 70) return Math.round(25 * adj);
  if (cognitiveLoad >= 40) return Math.round(35 * adj);
  return Math.round(45 * adj);
}

function getBreakMinutes(cognitiveLoad) {
  if (cognitiveLoad >= 70) return 10;
  if (cognitiveLoad >= 40) return 7;
  return 5;
}

function pad(n) { return String(n).padStart(2, '0'); }

// Ambient sound oscillator (Web Audio API)
function createAmbientSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2);
    gain.connect(ctx.destination);

    if (type === 'white_noise') {
      const bufSize = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true;
      src.connect(gain); src.start();
      return { ctx, stop: () => { gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); setTimeout(() => ctx.close(), 1100); } };
    }

    // Binaural-like tone for focus
    const osc = ctx.createOscillator();
    osc.type = 'sine'; osc.frequency.value = 40;
    osc.connect(gain); osc.start();
    return { ctx, stop: () => { gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); setTimeout(() => ctx.close(), 1100); } };
  } catch { return null; }
}

export default function FocusMode({ task }) {
  const { user, completeTask, dispatch } = useMindSpace();
  const meta = TYPE_META[task.energyType] || TYPE_META.admin;
  const brainState = user?.brainState || 'normal';

  const focusMins = getSessionMinutes(task.cognitiveLoad, brainState);
  const breakMins = getBreakMinutes(task.cognitiveLoad);

  const [phase, setPhase] = useState('focus');       // 'focus' | 'break' | 'done'
  const [secondsLeft, setSecondsLeft] = useState(focusMins * 60);
  const [totalSeconds] = useState(focusMins * 60);
  const [running, setRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [energyDrained, setEnergyDrained] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const progress = (totalSeconds - secondsLeft) / totalSeconds;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const energyPerSecond = (task.cognitiveLoad * 0.8) / (focusMins * 60);
  const currentEnergy = user?.energyProfile?.currentEnergy ?? 100;

  // Timer tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current);
          handlePhaseEnd();
          return 0;
        }
        setEnergyDrained(d => Math.round(d + energyPerSecond));
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const handlePhaseEnd = useCallback(() => {
    setRunning(false);
    if (phase === 'focus') {
      setSessionsCompleted(s => s + 1);
      setPhase('break');
      setSecondsLeft(breakMins * 60);
    } else {
      setPhase('focus');
      setSecondsLeft(focusMins * 60);
      setEnergyDrained(0);
    }
  }, [phase, breakMins, focusMins]);

  const toggleSound = () => {
    if (soundEnabled) {
      soundRef.current?.stop();
      soundRef.current = null;
      setSoundEnabled(false);
    } else {
      soundRef.current = createAmbientSound('white_noise');
      setSoundEnabled(true);
    }
  };

  const handleComplete = async () => {
    clearInterval(intervalRef.current);
    soundRef.current?.stop();
    const elapsed = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 60000)
      : task.estimatedDuration;
    await completeTask(task._id, elapsed);
  };

  const handleExit = () => {
    clearInterval(intervalRef.current);
    soundRef.current?.stop();
    dispatch({ type: 'SET_FOCUS_TASK', task: null });
  };

  const handleStart = () => {
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    setRunning(true);
  };

  // SVG ring
  const R = 120, C = 2 * Math.PI * R;
  const strokeDash = C - progress * C;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(4,4,13,0.97)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}>
      {/* Ambient glow bg */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${meta.glow.replace('0.3', '0.06')} 0%, transparent 70%)`
      }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>{meta.icon}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>{task.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              {sessionsCompleted > 0 && `${sessionsCompleted} session${sessionsCompleted > 1 ? 's' : ''} · `}
              {phase === 'focus' ? `Focus · ${focusMins} min` : `Break · ${breakMins} min`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleSound} className="btn-icon" title="Toggle ambient sound"
            style={{ color: soundEnabled ? meta.color : 'var(--text-3)', border: soundEnabled ? `1px solid ${meta.color}40` : undefined }}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={handleExit} className="btn btn-ghost" style={{ fontSize: 13 }}>Exit Focus</button>
        </div>
      </div>

      {/* Main timer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>

        {/* Phase label */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: phase === 'break' ? 'var(--teal)' : meta.color,
          background: phase === 'break' ? 'rgba(45,212,191,0.1)' : `${meta.color}12`,
          border: `1px solid ${phase === 'break' ? 'rgba(45,212,191,0.25)' : meta.color + '30'}`,
          padding: '5px 18px', borderRadius: 100
        }}>
          {phase === 'focus' ? '⚡ Deep Focus' : '🌿 Recovery Break'}
        </div>

        {/* SVG Ring Timer */}
        <div style={{ position: 'relative', width: 290, height: 290 }}>
          <svg width="290" height="290" viewBox="0 0 290 290" style={{ transform: 'rotate(-90deg)' }}>
            <defs>
              <filter id="focus-glow">
                <feGaussianBlur stdDeviation="6" result="cb"/>
                <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={phase === 'break' ? 'var(--teal)' : meta.color} />
                <stop offset="100%" stopColor={phase === 'break' ? '#22D3EE' : '#fff'} stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Background track */}
            <circle cx="145" cy="145" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
            {/* Tick marks */}
            {Array.from({ length: 60 }, (_, i) => {
              const a = (i / 60) * 2 * Math.PI;
              const len = i % 5 === 0 ? 12 : 6;
              const inner = R - 4, outer = R + len;
              return (
                <line key={i}
                  x1={145 + Math.cos(a) * inner} y1={145 + Math.sin(a) * inner}
                  x2={145 + Math.cos(a) * outer} y2={145 + Math.sin(a) * outer}
                  stroke="rgba(255,255,255,0.06)" strokeWidth={i % 5 === 0 ? 1.5 : 0.7}
                />
              );
            })}
            {/* Progress arc */}
            <circle cx="145" cy="145" r={R}
              fill="none"
              stroke="url(#timerGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={strokeDash}
              filter="url(#focus-glow)"
              style={{ transition: running ? 'stroke-dashoffset 1s linear' : 'stroke-dashoffset 0.3s ease' }}
            />
            {/* Glowing dot at tip */}
            {progress < 0.99 && (() => {
              const angle = progress * 2 * Math.PI;
              const dotX = 145 + Math.cos(angle) * R;
              const dotY = 145 + Math.sin(angle) * R;
              return <circle cx={dotX} cy={dotY} r="6" fill={phase === 'break' ? 'var(--teal)' : meta.color} filter="url(#focus-glow)" />;
            })()}
          </svg>

          {/* Center content */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            {/* Breathing animation ring */}
            <div style={{
              position: 'absolute', width: 180, height: 180, borderRadius: '50%',
              border: `1px solid ${meta.color}15`,
              animation: running ? 'breathe 4s ease-in-out infinite' : 'none'
            }} />

            <div style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700,
              fontSize: 56, color: 'var(--text-1)', lineHeight: 1,
              textShadow: `0 0 40px ${meta.color}50`,
              letterSpacing: '-0.02em'
            }}>
              {pad(mins)}:{pad(secs)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.1em' }}>
              {phase === 'focus' ? 'REMAINING' : 'BREAK'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!running ? (
            <button onClick={handleStart}
              className="btn btn-primary"
              style={{ padding: '14px 36px', fontSize: 16, borderRadius: 14, boxShadow: `0 0 40px ${meta.glow}` }}>
              {secondsLeft === (phase === 'focus' ? focusMins : breakMins) * 60 ? '▶ Start' : '▶ Resume'}
            </button>
          ) : (
            <button onClick={() => setRunning(false)}
              className="btn btn-ghost"
              style={{ padding: '14px 36px', fontSize: 16, borderRadius: 14 }}>
              ⏸ Pause
            </button>
          )}
          {phase === 'focus' && (
            <button onClick={handleComplete}
              className="btn"
              style={{
                padding: '14px 28px', fontSize: 15, borderRadius: 14,
                background: 'rgba(61,255,143,0.1)', border: '1px solid rgba(61,255,143,0.25)',
                color: 'var(--green)'
              }}>
              ✓ Done early
            </button>
          )}
          {phase === 'break' && (
            <button onClick={() => { setPhase('focus'); setSecondsLeft(focusMins * 60); setRunning(false); }}
              className="btn btn-ghost" style={{ padding: '14px 28px', fontSize: 15, borderRadius: 14 }}>
              Skip break
            </button>
          )}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
          {[
            { label: 'Session', value: `${focusMins}m / ${breakMins}m`, sub: 'focus / break' },
            { label: 'Energy Used', value: Math.round(energyDrained), sub: `of ${task.cognitiveLoad} total`, color: meta.color },
            { label: 'Sessions', value: sessionsCompleted, sub: 'completed' },
            { label: 'Remaining', value: `${currentEnergy - energyDrained}`, sub: 'energy units', color: (currentEnergy - energyDrained) < 20 ? 'var(--red)' : 'var(--green)' }
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 600, color: s.color || 'var(--text-1)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-4)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Cognitive load depletion bar */}
        <div style={{ width: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cognitive Load Depleting</span>
            <span style={{ fontSize: 11, color: meta.color, fontFamily: 'var(--font-mono)' }}>{Math.round((energyDrained / task.cognitiveLoad) * 100)}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-fill" style={{
              width: `${Math.min(100, (energyDrained / task.cognitiveLoad) * 100)}%`,
              background: `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
              boxShadow: `0 0 8px ${meta.color}60`,
              transition: 'width 1s linear'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
