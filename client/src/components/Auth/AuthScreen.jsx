import React, { useState, useEffect, useRef } from 'react';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';

// ── Neural Canvas Background ──────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NODES = 55;
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.5 + 1,
      pulse: Math.random() * Math.PI * 2
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(61,255,143,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 0.6 + Math.sin(n.pulse) * 0.4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(61,255,143,${0.3 + pulse * 0.4})`;
        ctx.fill();

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
        grad.addColorStop(0, `rgba(61,255,143,0.15)`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ── Auth Screen ───────────────────────────────────────────────────────────
export default function AuthScreen() {
  const { login, register } = useMindSpace();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      background: 'var(--bg-void)'
    }}>
      {/* ── Left: Visual panel ── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid var(--border)'
      }}>
        <NeuralCanvas />
        {/* Overlay content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 48,
          background: 'linear-gradient(to top, rgba(4,4,13,0.9) 0%, transparent 60%)'
        }}>
          <div className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--green), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20
              }}>🧠</div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>MindSpace</span>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 42, lineHeight: 1.1,
              marginBottom: 16, letterSpacing: '-0.02em'
            }}>
              Your Mind,<br />
              <span className="text-gradient">Budgeted.</span>
            </h1>
            <p style={{ color: 'var(--text-2)', fontSize: 16, lineHeight: 1.65, maxWidth: 360 }}>
              Treat your attention like a financial asset. Track cognitive load, prevent mental burnout, and allocate your best thinking where it matters most.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 32 }}>
              {[
                { icon: '⚡', label: 'Energy Budget' },
                { icon: '🎯', label: 'Smart Scheduling' },
                { icon: '📊', label: 'Cognitive Analytics' }
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-2)', fontSize: 13 }}>
                  <span>{f.icon}</span><span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 48
      }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-scale-in">
          {/* Tab switcher */}
          <div style={{
            display: 'flex', gap: 4,
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: 4,
            marginBottom: 36
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '10px',
                  border: 'none', cursor: 'pointer',
                  borderRadius: 9,
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600, fontSize: 14,
                  transition: 'all 0.2s',
                  background: mode === m
                    ? 'linear-gradient(135deg, var(--green), var(--cyan))'
                    : 'transparent',
                  color: mode === m ? '#04040D' : 'var(--text-2)'
                }}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: 26, marginBottom: 8, letterSpacing: '-0.02em'
          }}>
            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 32 }}>
            {mode === 'login'
              ? 'Sign in to continue managing your cognitive budget.'
              : 'Create your account and begin protecting your mental energy.'}
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div>
                <label className="label">Full Name</label>
                <input className="input" type="text" placeholder="Alex Chen" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: 'rgba(255,75,110,0.1)',
                border: '1px solid rgba(255,75,110,0.25)',
                color: 'var(--red)', fontSize: 13
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '13px', fontSize: 15, marginTop: 4 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (mode === 'login' ? 'Enter MindSpace →' : 'Begin →')}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-3)', fontSize: 12 }}>
            Your cognitive data stays private. Always.
          </p>
        </div>
      </div>
    </div>
  );
}
