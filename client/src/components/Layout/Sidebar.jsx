import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';

const NAV = [
  { path: '/',         label: 'Dashboard',  icon: '⬡' },
  { path: '/tasks',    label: 'Tasks',       icon: '◈' },
  { path: '/analytics',label: 'Analytics',  icon: '◉' }
];

const BRAIN_STATES = [
  { value: 'sharp',     emoji: '⚡', label: 'Sharp',     color: 'var(--green)' },
  { value: 'focused',   emoji: '🎯', label: 'Focused',   color: 'var(--cyan)' },
  { value: 'normal',    emoji: '🧠', label: 'Normal',    color: 'var(--text-2)' },
  { value: 'tired',     emoji: '😑', label: 'Tired',     color: 'var(--amber)' },
  { value: 'exhausted', emoji: '💀', label: 'Depleted',  color: 'var(--red)' }
];

export default function Sidebar() {
  const { user, logout, updateBrainState, takeBreak, dispatch } = useMindSpace();
  const navigate = useNavigate();
  const [showBreak, setShowBreak] = React.useState(false);
  const [showBrainPicker, setShowBrainPicker] = React.useState(false);

  const energy = user?.energyProfile?.currentEnergy ?? 100;
  const budget = user?.energyProfile?.dailyBudget ?? 100;
  const pct = Math.round((energy / budget) * 100);
  const energyColor = pct > 60 ? 'var(--green)' : pct > 30 ? 'var(--amber)' : 'var(--red)';
  const currentState = BRAIN_STATES.find(b => b.value === user?.brainState) || BRAIN_STATES[2];

  const handleBreak = async (mins) => {
    setShowBreak(false);
    await takeBreak(mins);
  };

  const handleBrainState = async (val) => {
    setShowBrainPicker(false);
    await updateBrainState(val);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--green), var(--cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0
        }}>🧠</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em' }}>
          MindSpace
        </span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
              background: isActive ? 'rgba(61,255,143,0.08)' : 'transparent',
              color: isActive ? 'var(--green)' : 'var(--text-2)',
              border: isActive ? '1px solid rgba(61,255,143,0.18)' : '1px solid transparent'
            })}>
            <span style={{ fontSize: 18, opacity: 0.9 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <hr className="divider" style={{ margin: '24px 0' }} />

      {/* Energy Mini-gauge */}
      <div className="glass" style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Energy</span>
          <span style={{ fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 600, color: energyColor }}>
            {energy}<span style={{ color: 'var(--text-3)', fontSize: 11 }}>/{budget}</span>
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${energyColor}, ${energyColor}88)`,
            boxShadow: `0 0 8px ${energyColor}44`
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, textAlign: 'right' }}>{pct}% remaining</div>
      </div>

      {/* Brain state picker */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <button onClick={() => setShowBrainPicker(s => !s)} style={{
          width: '100%', padding: '10px 12px',
          background: 'var(--card-bg)', border: '1px solid var(--border)',
          borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          color: currentState.color, fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500
        }}>
          <span>{currentState.emoji}</span>
          <span style={{ flex: 1, textAlign: 'left' }}>{currentState.label}</span>
          <span style={{ color: 'var(--text-3)', fontSize: 11 }}>▾</span>
        </button>
        {showBrainPicker && (
          <div className="glass" style={{
            position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
            padding: 6, zIndex: 200, animation: 'scaleIn 0.2s var(--ease-spring)'
          }}>
            {BRAIN_STATES.map(bs => (
              <button key={bs.value} onClick={() => handleBrainState(bs.value)} style={{
                width: '100%', padding: '8px 10px',
                background: 'transparent', border: 'none', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 8,
                cursor: 'pointer', color: bs.color,
                fontSize: 13, fontFamily: 'var(--font-body)',
                transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>{bs.emoji}</span><span>{bs.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Take a break */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowBreak(s => !s)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
          🌿 Take a break
        </button>
        {showBreak && (
          <div className="glass" style={{
            position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
            padding: 8, zIndex: 200, animation: 'scaleIn 0.2s var(--ease-spring)'
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Break duration</p>
            {[
              { mins: 5, label: '5 min  — Micro break', recovery: '+8 energy' },
              { mins: 15, label: '15 min — Standard', recovery: '+18 energy' },
              { mins: 30, label: '30 min — Power break', recovery: '+25 energy' },
              { mins: 60, label: '60 min — Full reset', recovery: '+32 energy' }
            ].map(b => (
              <button key={b.mins} onClick={() => handleBreak(b.mins)} style={{
                width: '100%', padding: '8px 10px',
                background: 'transparent', border: 'none', borderRadius: 8,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', color: 'var(--text-1)', fontSize: 13,
                fontFamily: 'var(--font-body)', transition: 'background 0.15s'
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>{b.label}</span>
                <span style={{ color: 'var(--green)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{b.recovery}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cognitive debt indicator */}
      {user?.cognitiveDebt > 0 && (
        <div style={{
          marginTop: 12, padding: '10px 12px',
          background: 'rgba(255,75,110,0.08)',
          border: '1px solid rgba(255,75,110,0.2)',
          borderRadius: 10, fontSize: 12, color: 'var(--red)'
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginBottom: 2, opacity: 0.7 }}>COGNITIVE DEBT</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600 }}>{Math.round(user.cognitiveDebt)}</span>
          <span style={{ opacity: 0.6 }}> units</span>
        </div>
      )}

      {/* Bottom spacer + logout */}
      <div style={{ flex: 1 }} />
      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <div style={{ marginBottom: 10, padding: '8px 0' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{user?.email}</div>
        </div>
        <button onClick={logout} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, color: 'var(--text-3)' }}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
