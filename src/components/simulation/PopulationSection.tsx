import React from 'react';

interface PopulationSectionProps {
  multiplier: number;
  onChange: (value: number) => void;
  expanded: boolean;
  onToggle: () => void;
  baseTotal?: number;
}

export default React.memo(function PopulationSection({
  multiplier,
  onChange,
  expanded,
  onToggle,
  baseTotal,
}: PopulationSectionProps) {
  const estimatedTotal = baseTotal ? Math.round(baseTotal * multiplier) : null;
  const isModified = multiplier !== 1.0;

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#e4e4e7',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
          Mật độ người
          {isModified && (
            <span style={{
              fontSize: 10,
              background: 'rgba(245,158,11,0.15)',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 700,
            }}>
              x{multiplier.toFixed(1)}
            </span>
          )}
        </span>
        <span style={{
          fontSize: 12,
          transition: 'transform 0.2s',
          transform: expanded ? 'rotate(180deg)' : '',
          color: '#71717a',
        }}>▾</span>
      </button>

      <div style={{
        maxHeight: expanded ? 200 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Multiplier display */}
          <div style={{
            textAlign: 'center',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: 10,
            padding: '12px 0',
          }}>
            <div style={{
              fontSize: 28,
              fontWeight: 800,
              color: isModified ? '#f59e0b' : '#71717a',
              fontFamily: 'monospace',
              letterSpacing: '-0.02em',
            }}>
              {multiplier.toFixed(1)}x
            </div>
            {estimatedTotal !== null && (
              <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
                ≈ {estimatedTotal} người dự kiến
              </div>
            )}
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.1}
              value={multiplier}
              onChange={(e) => onChange(Number(e.target.value))}
              style={{
                width: '100%',
                height: 6,
                appearance: 'none',
                background: `linear-gradient(90deg, #3f3f46 0%, #f59e0b 50%, #ef4444 100%)`,
                borderRadius: 3,
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 9, color: '#52525b' }}>0.1x</span>
              <span
                style={{ fontSize: 9, color: '#71717a', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => onChange(1.0)}
              >1.0x (mặc định)</span>
              <span style={{ fontSize: 9, color: '#52525b' }}>3.0x</span>
            </div>
          </div>

          {/* Quick presets */}
          <div style={{ display: 'flex', gap: 6 }}>
            {[0.5, 1.0, 1.5, 2.0, 3.0].map((val) => (
              <button
                key={val}
                onClick={() => onChange(val)}
                style={{
                  flex: 1,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: `1px solid ${multiplier === val ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  background: multiplier === val ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.03)',
                  color: multiplier === val ? '#f59e0b' : '#71717a',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >{val}x</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
