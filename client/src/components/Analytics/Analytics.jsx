import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Cell
} from 'recharts';
import { useMindSpace } from '../../context/MindSpaceContext.jsx';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TYPE_META = {
  deep_work: { label: 'Deep Work', color: '#00D4FF' },
  creative:  { label: 'Creative',  color: '#B57BFF' },
  admin:     { label: 'Admin',     color: '#FFB443' },
  social:    { label: 'Social',    color: '#FF6BB5' },
  recovery:  { label: 'Recovery',  color: '#2DD4BF' }
};

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(10,10,28,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px',
      fontFamily: 'var(--font-mono)', fontSize: 12
    }}>
      <div style={{ color: 'var(--text-3)', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{p.name}:</span>
          <span style={{ fontWeight: 600 }}>{Math.round(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart using pure SVG
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 12 }}>No data</div>;

  const cx = size / 2, cy = size / 2, r = size * 0.36, inner = size * 0.22;
  let angle = -Math.PI / 2;
  const paths = data.map(d => {
    const slice = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + slice), y2 = cy + r * Math.sin(angle + slice);
    const lf = slice > Math.PI ? 1 : 0;
    const xi1 = cx + inner * Math.cos(angle), yi1 = cy + inner * Math.sin(angle);
    const xi2 = cx + inner * Math.cos(angle + slice), yi2 = cy + inner * Math.sin(angle + slice);
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${lf} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 ${lf} 0 ${xi1} ${yi1} Z`;
    const midAngle = angle + slice / 2;
    angle += slice;
    return { path, color: d.color, label: d.label, value: d.value, pct: Math.round((d.value / total) * 100), midAngle };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        {paths.map((p, i) => (
          <filter key={i} id={`donut-glow-${i}`}>
            <feGaussianBlur stdDeviation="2" result="cb"/>
            <feMerge><feMergeNode in="cb"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        ))}
      </defs>
      {paths.map((p, i) => (
        <path key={i} d={p.path} fill={p.color} opacity={0.85}
          filter={`url(#donut-glow-${i})`}
          style={{ transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.target.setAttribute('opacity', '1')}
          onMouseLeave={e => e.target.setAttribute('opacity', '0.85')}
        />
      ))}
      {/* Center: largest segment % */}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize={size * 0.14} fontWeight="700" fontFamily="JetBrains Mono">
        {paths[0]?.pct}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={size * 0.075} fontFamily="JetBrains Mono">
        {paths[0]?.label}
      </text>
    </svg>
  );
}

function InsightCard({ insight, delay }) {
  const config = {
    success: { color: 'var(--green)', bg: 'rgba(61,255,143,0.07)', border: 'rgba(61,255,143,0.2)', icon: '✓' },
    warning: { color: 'var(--amber)', bg: 'rgba(255,180,67,0.07)', border: 'rgba(255,180,67,0.2)', icon: '⚠' },
    danger:  { color: 'var(--red)',   bg: 'rgba(255,75,110,0.07)', border: 'rgba(255,75,110,0.2)', icon: '!' },
    info:    { color: 'var(--cyan)',  bg: 'rgba(0,212,255,0.07)',  border: 'rgba(0,212,255,0.2)', icon: 'i' }
  };
  const c = config[insight.type] || config.info;
  return (
    <div className="animate-fade-up" style={{
      padding: '14px 18px', borderRadius: 12, animationDelay: `${delay}s`,
      background: c.bg, border: `1px solid ${c.border}`,
      display: 'flex', gap: 12, alignItems: 'flex-start'
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 1,
        background: c.bg, border: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: c.color
      }}>{c.icon}</div>
      <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.6 }}>{insight.text}</p>
    </div>
  );
}

export default function Analytics() {
  const { fetchAnalytics, user } = useMindSpace();
  const [data, setData] = useState(null);
  const [range, setRange] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(range)
      .then(d => setData(d))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>LOADING ANALYTICS</p>
      </div>
    );
  }

  if (!data) return null;

  const { summary, typeBreakdown, priorityStats, energyTrend, weekdayPattern, insights } = data;

  const typeDonutData = Object.entries(typeBreakdown).map(([type, count]) => ({
    label: TYPE_META[type]?.label || type,
    value: count,
    color: TYPE_META[type]?.color || '#888'
  })).sort((a, b) => b.value - a.value);

  const weekData = weekdayPattern.map(d => ({
    day: DAY_LABELS[d.day],
    avgLoad: d.avgLoad,
    count: d.count
  }));

  const trendData = energyTrend.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    budget: d.budget,
    spent: d.spent,
    score: d.score ?? 0,
    tasks: d.tasksCompleted
  }));

  const priorityEntries = Object.entries(priorityStats);

  return (
    <div>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Cognitive <span className="text-gradient">Analytics</span>
          </h1>
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            Patterns, performance, and cognitive debt analysis
          </p>
        </div>
        {/* Range selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 4 }}>
          {[7, 14, 30].map(d => (
            <button key={d} onClick={() => setRange(d)} style={{
              padding: '7px 14px', border: 'none', borderRadius: 7, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600,
              background: range === d ? 'rgba(61,255,143,0.15)' : 'transparent',
              color: range === d ? 'var(--green)' : 'var(--text-3)',
              transition: 'all 0.2s'
            }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Completion Rate', value: `${summary.completionRate}%`, color: summary.completionRate > 70 ? 'var(--green)' : summary.completionRate > 40 ? 'var(--amber)' : 'var(--red)' },
          { label: 'Tasks Completed', value: summary.completed, color: 'var(--cyan)' },
          { label: 'Avg Load/Task',   value: summary.avgCognitiveLoad, color: 'var(--purple)' },
          { label: 'Cognitive Debt',  value: Math.round(user?.cognitiveDebt ?? 0), color: (user?.cognitiveDebt ?? 0) > 20 ? 'var(--red)' : 'var(--amber)' }
        ].map((s, i) => (
          <div key={s.label} className="glass animate-fade-up" style={{ padding: '18px 20px', animationDelay: `${i * 0.05}s` }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Energy trend */}
        <div className="glass animate-fade-up" style={{ padding: '22px 24px', animationDelay: '0.1s' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Energy Spent vs Budget</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3DFF8F" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3DFF8F" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <XAxis dataKey="date" tick={{ fill: '#505080', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#505080', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="budget" name="Budget" stroke="#3DFF8F" strokeWidth={2} fill="url(#budgetGrad)" dot={false} />
                <Area type="monotone" dataKey="spent"  name="Spent"  stroke="#00D4FF" strokeWidth={2} fill="url(#spentGrad)" dot={{ fill: '#00D4FF', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              Complete tasks to see energy trend data
            </div>
          )}
        </div>

        {/* Type breakdown donut */}
        <div className="glass animate-fade-up" style={{ padding: '22px 24px', animationDelay: '0.15s', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 18, alignSelf: 'flex-start' }}>Task Types</h3>
          {typeDonutData.length > 0 ? (
            <>
              <DonutChart data={typeDonutData} size={150} />
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7, marginTop: 16 }}>
                {typeDonutData.map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-2)', flex: 1 }}>{d.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: d.color }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              No completed tasks yet
            </div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Weekday cognitive load pattern */}
        <div className="glass animate-fade-up" style={{ padding: '22px 24px', animationDelay: '0.2s' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Weekly Load Pattern</h3>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Avg cognitive load by day of week</p>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={weekData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#505080', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#505080', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgLoad" name="Avg Load" radius={[4, 4, 0, 0]}>
                {weekData.map((_, i) => (
                  <Cell key={i} fill={`rgba(0,212,255,${0.3 + (_.avgLoad / 100) * 0.7})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority completion rates */}
        <div className="glass animate-fade-up" style={{ padding: '22px 24px', animationDelay: '0.25s' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Priority Completion</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {priorityEntries.map(([priority, stats]) => {
              const pColors = { critical: 'var(--red)', high: 'var(--amber)', medium: 'var(--cyan)', low: 'var(--text-3)' };
              const col = pColors[priority] || 'var(--text-2)';
              return (
                <div key={priority}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: col, textTransform: 'capitalize', fontWeight: 600 }}>{priority}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                      {stats.completed}/{stats.total} · {stats.rate}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${stats.rate}%`,
                      background: `linear-gradient(90deg, ${col}, ${col}80)`,
                      boxShadow: `0 0 6px ${col}40`
                    }} />
                  </div>
                </div>
              );
            })}
            {priorityEntries.length === 0 && (
              <div style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                No task data for this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights?.length > 0 && (
        <div className="glass animate-fade-up" style={{ padding: '22px 24px', animationDelay: '0.3s' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            🧠 Cognitive Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} delay={0.3 + i * 0.05} />)}
          </div>
        </div>
      )}

      {/* Focus time summary */}
      <div className="glass animate-fade-up" style={{ padding: '22px 24px', marginTop: 16, animationDelay: '0.35s' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Session Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'Total Focus Time', value: `${Math.floor(summary.totalFocusMinutes / 60)}h ${summary.totalFocusMinutes % 60}m`, icon: '⏱' },
            { label: 'Tasks Deferred', value: summary.deferred, icon: '↻', color: summary.deferred > 5 ? 'var(--amber)' : 'var(--text-1)' },
            { label: 'All-Time Streak', value: `${user?.stats?.streak ?? 0} days`, icon: '🔥', color: 'var(--amber)' }
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: s.color || 'var(--text-1)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
