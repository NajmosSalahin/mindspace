import React, { useEffect, useRef } from 'react';

const RADIUS = 88;
const STROKE_W = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getColor(pct) {
  if (pct > 60) return { stroke: '#3DFF8F', glow: 'rgba(61,255,143,0.5)', text: '#3DFF8F' };
  if (pct > 30) return { stroke: '#FFB443', glow: 'rgba(255,180,67,0.5)', text: '#FFB443' };
  return { stroke: '#FF4B6E', glow: 'rgba(255,75,110,0.5)', text: '#FF4B6E' };
}

export default function EnergyGauge({ energy = 100, budget = 100, size = 220 }) {
  const pct = Math.max(0, Math.min(100, Math.round((energy / budget) * 100)));
  const color = getColor(pct);
  const viewBox = 210;
  const cx = viewBox / 2, cy = viewBox / 2;

  // Arc offset: start full (0 offset) → drain to empty (full circumference)
  const dashOffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  // Second ring: daily budget indicator (lighter)
  const budgetOffset = CIRCUMFERENCE * 0.1; // always 90% of ring

  const isLow = pct <= 30;

  return (
    <div style={{
      position: 'relative',
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <svg
        width={size} height={size}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color.stroke} stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Center fill glow */}
        <circle cx={cx} cy={cy} r={RADIUS - 6} fill="url(#centerGrad)" style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px` }} />

        {/* Track */}
        <circle
          cx={cx} cy={cy} r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={STROKE_W}
        />

        {/* Tick marks */}
        {Array.from({ length: 20 }, (_, i) => {
          const angle = ((i / 20) * 360 * Math.PI) / 180;
          const inner = RADIUS - STROKE_W / 2 - 4;
          const outer = RADIUS + STROKE_W / 2 + 2;
          const x1 = cx + Math.cos(angle) * inner;
          const y1 = cy + Math.sin(angle) * inner;
          const x2 = cx + Math.cos(angle) * (i % 5 === 0 ? outer + 2 : outer);
          const y2 = cy + Math.sin(angle) * (i % 5 === 0 ? outer + 2 : outer);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(255,255,255,0.06)" strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
            />
          );
        })}

        {/* Main energy arc */}
        <circle
          cx={cx} cy={cy} r={RADIUS}
          fill="none"
          stroke={color.stroke}
          strokeWidth={STROKE_W}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          filter="url(#glow-filter)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.6s ease' }}
        />

        {/* Trailing dot at end of arc */}
        {pct > 2 && (() => {
          const angle = ((pct / 100) * 360 - 90) * (Math.PI / 180);
          const dotX = cx + Math.cos(angle) * RADIUS;
          const dotY = cy + Math.sin(angle) * RADIUS;
          return (
            <circle cx={dotX} cy={dotY} r={5}
              fill={color.stroke}
              filter="url(#glow-filter)"
              style={{ transform: 'rotate(90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}
            />
          );
        })()}
      </svg>

      {/* Center info */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 4
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontWeight: 600,
          fontSize: size * 0.19, color: color.text,
          lineHeight: 1,
          textShadow: `0 0 30px ${color.glow}`,
          transition: 'color 0.6s, text-shadow 0.6s',
          animation: isLow ? 'pulse-red 2s ease-in-out infinite' : undefined
        }}>
          {pct}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Energy %
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
          {energy}<span style={{ color: 'var(--text-4)' }}>/{budget}</span>
        </div>
      </div>
    </div>
  );
}
