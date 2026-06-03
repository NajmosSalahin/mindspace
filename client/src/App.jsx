import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MindSpaceProvider, useMindSpace } from './context/MindSpaceContext.jsx';
import AuthScreen from './components/Auth/AuthScreen.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import TaskManager from './components/Tasks/TaskManager.jsx';
import Analytics from './components/Analytics/Analytics.jsx';
import FocusMode from './components/FocusMode/FocusMode.jsx';
import Sidebar from './components/Layout/Sidebar.jsx';

// ── Notification Toast ────────────────────────────────────────────────────
function Toast() {
  const { notification } = useMindSpace();
  if (!notification) return null;

  const colors = {
    success: { border: 'rgba(61,255,143,0.35)', icon: '✓', glow: 'var(--green-glow)' },
    warning: { border: 'rgba(255,180,67,0.35)', icon: '⚠', glow: 'var(--amber-glow)' },
    danger:  { border: 'rgba(255,75,110,0.35)', icon: '!', glow: 'var(--red-glow)' },
    info:    { border: 'rgba(0,212,255,0.3)',   icon: 'i', glow: 'var(--cyan-glow)' }
  };
  const c = colors[notification.type] || colors.info;

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: 'rgba(10,10,28,0.95)',
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      padding: '13px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 0 30px ${c.glow}, 0 20px 40px rgba(0,0,0,0.5)`,
      backdropFilter: 'blur(20px)',
      maxWidth: 340,
      animation: 'fadeUp 0.3s ease both',
      fontFamily: 'var(--font-body)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-1)' }}>{notification.message}</span>
    </div>
  );
}

// ── Protected Layout ──────────────────────────────────────────────────────
function AppLayout() {
  const { user, loading, focusTask } = useMindSpace();

  if (loading.auth) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--green)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>LOADING MINDSPACE</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="app-layout">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Sidebar />

      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/tasks"    element={<TaskManager />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Focus Mode overlay */}
      {focusTask && <FocusMode task={focusTask} />}

      <Toast />
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <MindSpaceProvider>
      <Routes>
        <Route path="/auth" element={<AuthGate />} />
        <Route path="/*"   element={<AppLayout />} />
      </Routes>
    </MindSpaceProvider>
  );
}

function AuthGate() {
  const { user, loading } = useMindSpace();
  if (loading.auth) return null;
  if (user) return <Navigate to="/" replace />;
  return <AuthScreen />;
}
