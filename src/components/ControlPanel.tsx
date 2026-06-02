import type { ConnectionStatus, QuickPickItem } from '../types/heatmap';
import { STATUS_COLOR, STATUS_LABEL } from '../constants/heatmap';

interface ControlPanelProps {
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
  connStatus: ConnectionStatus;
  lastUpdated: Date | null;
  errorMsg: string | null;
  isLive: boolean;
  targetDateStr: string;
  setTargetDateStr: (dateStr: string) => void;
  quickPicks: QuickPickItem[];
}

import React from 'react';

export default React.memo(function ControlPanel({
  panelCollapsed,
  setPanelCollapsed,
  connStatus,
  lastUpdated,
  errorMsg,
  isLive,
  targetDateStr,
  setTargetDateStr,
  quickPicks,
}: ControlPanelProps) {
  return (
    <div
      className="absolute top-4 left-4 z-10 flex flex-col select-none"
      style={{ width: panelCollapsed ? 52 : 320 }}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        style={{
          background: 'rgba(15,15,20,0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: panelCollapsed ? 14 : '14px 14px 0 0',
          color: '#a1a1aa',
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          transition: 'all .2s',
        }}
      >
        {!panelCollapsed && (
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg,#38bdf8,#a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Crowd Analytics
          </span>
        )}
        <span
          style={{
            fontSize: 18,
            lineHeight: 1,
            transition: 'transform .2s',
            transform: panelCollapsed ? 'rotate(180deg)' : '',
          }}
        >
          ◀
        </span>
      </button>

      {!panelCollapsed && (
        <div
          style={{
            background: 'rgba(15,15,20,0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            borderRadius: '0 0 14px 14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* ── Connection Badge ──── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: STATUS_COLOR[connStatus],
                boxShadow: `0 0 6px ${STATUS_COLOR[connStatus]}`,
                animation: connStatus === 'live' ? 'pulse 2s infinite' : undefined,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: STATUS_COLOR[connStatus],
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {STATUS_LABEL[connStatus]}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#52525b' }}>
              {lastUpdated?.toLocaleTimeString() ?? '—'}
            </span>
          </div>

          {/* ── Error message if API fails ── */}
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 10,
                padding: '10px 12px',
                fontSize: 11,
                color: '#fca5a5',
                lineHeight: '1.4',
              }}
            >
              <div style={{ fontWeight: 700, color: '#f87171', marginBottom: 2 }}>⚠️ API Predict Error</div>
              {errorMsg}
            </div>
          )}

          {/* ── Divider ──── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* ── Time Picker Section ──── */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 12,
            padding: 12,
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>

              {!isLive && (
                <button
                  onClick={() => setTargetDateStr('')}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#10b981',
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: '0 0 10px rgba(16,185,129,0.1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.2)';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(16,185,129,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(16,185,129,0.1)';
                  }}
                >
                  ● GO LIVE
                </button>
              )}
            </div>

            {/* datetime-local input */}
            <div className="relative group">
              <input
                type="datetime-local"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#f4f4f5',
                  border: '1px solid rgba(167,139,250,0.3)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 14,
                  fontWeight: 500,
                  outline: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  colorScheme: 'dark',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#a78bfa';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(167,139,250,0.2), inset 0 2px 4px rgba(0,0,0,0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,0.3)';
                  e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.5)';
                }}
              />
              <div className="absolute top-0 right-0 h-full w-10 flex items-center justify-center pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <span style={{color: '#a78bfa', fontSize: 16}}>📅</span>
              </div>
            </div>

            {/* Quick-pick chips */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 12 }}>
              {quickPicks.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => setTargetDateStr(qp.value)}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: targetDateStr === qp.value ? '#fff' : '#a1a1aa',
                    background: targetDateStr === qp.value ? 'linear-gradient(135deg, rgba(167,139,250,0.4), rgba(139,92,246,0.4))' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${
                      targetDateStr === qp.value ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.05)'
                    }`,
                    borderRadius: 6,
                    padding: '6px 8px',
                    cursor: 'pointer',
                    transition: 'all .2s',
                    boxShadow: targetDateStr === qp.value ? '0 4px 12px rgba(139,92,246,0.2)' : 'none',
                    textShadow: targetDateStr === qp.value ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (targetDateStr !== qp.value) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (targetDateStr !== qp.value) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }
                  }}
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Divider ──── */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          {/* ── Color Legend ──── */}
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: '#52525b',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: 6,
                display: 'block',
              }}
            >
              Density Scale
            </span>
            <div
              style={{
                height: 10,
                borderRadius: 5,
                background:
                  'linear-gradient(90deg, #1e3cb4, #0096dc, #00c8a0, #50d264, #b4dc32, #ffdc00, #ff9600, #dc1e14)',
                opacity: 0.9,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
              <span style={{ fontSize: 9, color: '#52525b' }}>Low</span>
              <span style={{ fontSize: 9, color: '#52525b' }}>High</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
});
