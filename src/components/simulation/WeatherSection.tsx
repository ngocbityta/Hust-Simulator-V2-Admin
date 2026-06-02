import React from 'react';
import type { WeatherOverride } from '../../types/simulation';

interface WeatherSectionProps {
  weather: WeatherOverride | null;
  onChange: (weather: WeatherOverride | null) => void;
  expanded: boolean;
  onToggle: () => void;
}

const PRESETS: Array<{ label: string; emoji: string; temp: number; rain: number }> = [
  { label: 'Nắng đẹp', emoji: '☀️', temp: 30, rain: 0 },
  { label: 'Mưa nhẹ', emoji: '🌧️', temp: 25, rain: 1.5 },
  { label: 'Mưa to', emoji: '⛈️', temp: 22, rain: 8 },
  { label: 'Trời lạnh', emoji: '❄️', temp: 12, rain: 0 },
  { label: 'Nóng nực', emoji: '🥵', temp: 40, rain: 0 },
];

export default React.memo(function WeatherSection({
  weather,
  onChange,
  expanded,
  onToggle,
}: WeatherSectionProps) {
  const temp = weather?.temp ?? 28;
  const rain = weather?.rain ?? 0;

  const handleTempChange = (val: number) => {
    onChange({ temp: val, rain });
  };
  const handleRainChange = (val: number) => {
    onChange({ temp, rain: val });
  };

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
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
          Thời tiết
          {weather && (
            <span style={{
              fontSize: 10,
              background: 'rgba(245,158,11,0.15)',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 700,
            }}>
              Đã chỉnh
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

      {/* Content */}
      <div style={{
        maxHeight: expanded ? 300 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Temperature Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>🌡️ Nhiệt độ</span>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: temp > 35 ? '#ef4444' : temp < 15 ? '#38bdf8' : '#f59e0b',
                fontFamily: 'monospace',
              }}>{temp}°C</span>
            </div>
            <input
              type="range"
              min={5}
              max={45}
              step={1}
              value={temp}
              onChange={(e) => handleTempChange(Number(e.target.value))}
              style={{
                width: '100%',
                height: 6,
                appearance: 'none',
                background: `linear-gradient(90deg, #38bdf8 0%, #22c55e 30%, #f59e0b 60%, #ef4444 100%)`,
                borderRadius: 3,
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 9, color: '#52525b' }}>5°C</span>
              <span style={{ fontSize: 9, color: '#52525b' }}>45°C</span>
            </div>
          </div>

          {/* Rain Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: '#a1a1aa', fontWeight: 500 }}>💧 Lượng mưa</span>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: rain > 5 ? '#38bdf8' : rain > 0 ? '#818cf8' : '#71717a',
                fontFamily: 'monospace',
              }}>{rain.toFixed(1)}mm</span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={rain}
              onChange={(e) => handleRainChange(Number(e.target.value))}
              style={{
                width: '100%',
                height: 6,
                appearance: 'none',
                background: `linear-gradient(90deg, #3f3f46 0%, #818cf8 40%, #38bdf8 100%)`,
                borderRadius: 3,
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
              <span style={{ fontSize: 9, color: '#52525b' }}>0mm</span>
              <span style={{ fontSize: 9, color: '#52525b' }}>15mm</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PRESETS.map((p) => {
              const isActive = weather && weather.temp === p.temp && weather.rain === p.rain;
              return (
                <button
                  key={p.label}
                  onClick={() => onChange({ temp: p.temp, rain: p.rain })}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '5px 10px',
                    borderRadius: 8,
                    border: `1px solid ${isActive ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    background: isActive
                      ? 'rgba(245,158,11,0.15)'
                      : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#f59e0b' : '#a1a1aa',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{p.emoji}</span> {p.label}
                </button>
              );
            })}
          </div>

          {/* Reset Button */}
          {weather && (
            <button
              onClick={() => onChange(null)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#71717a',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '6px 0',
                cursor: 'pointer',
                transition: 'all 0.15s',
                width: '100%',
              }}
            >
              Dùng thời tiết thực
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
