import React, { useState, useMemo } from 'react';
import type { SimulationScenario, WeatherOverride, VirtualEvent, ClosedFacility } from '../types/simulation';
import type { HeatmapResponse, QuickPickItem } from '../types/heatmap';
import WeatherSection from './simulation/WeatherSection';
import EventsSection from './simulation/EventsSection';
import FacilitiesSection from './simulation/FacilitiesSection';
import PopulationSection from './simulation/PopulationSection';

interface SimulationPanelProps {
  scenario: SimulationScenario;
  result: HeatmapResponse | null;
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  onSetWeather: (weather: WeatherOverride | null) => void;
  onAddEvent: (event: VirtualEvent) => void;
  onRemoveEvent: (id: string) => void;
  onUpdateEvent: (id: string, updates: Partial<VirtualEvent>) => void;
  onToggleFacility: (facility: ClosedFacility) => void;
  onSetMultiplier: (value: number) => void;
  onSetTargetTime: (value: string) => void;
  onRunSimulation: () => void;
  onResetAll: () => void;
  onExitSimulation: () => void;
  quickPicks: QuickPickItem[];
  panelCollapsed: boolean;
  setPanelCollapsed: (v: boolean) => void;
}

export default React.memo(function SimulationPanel({
  scenario,
  result,
  loading,
  error,
  hasChanges,
  onSetWeather,
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
  onToggleFacility,
  onSetMultiplier,
  onSetTargetTime,
  onRunSimulation,
  onResetAll,
  onExitSimulation,
  quickPicks,
  panelCollapsed,
  setPanelCollapsed,
}: SimulationPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    weather: true,
    events: true,
    facilities: false,
    population: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Count total changes for badge
  const changeCount = useMemo(() => {
    let c = 0;
    if (scenario.weatherOverride) c++;
    c += scenario.virtualEvents.length;
    c += scenario.closedFacilities.length;
    if (scenario.userCountMultiplier !== 1.0) c++;
    return c;
  }, [scenario]);

  return (
    <div
      className="absolute top-4 left-4 z-10 flex flex-col select-none"
      style={{ width: panelCollapsed ? 52 : 340 }}
    >
      {/* Header */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        style={{
          background: 'rgba(15,15,20,0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: panelCollapsed ? 14 : '14px 14px 0 0',
          color: '#f59e0b',
          padding: '10px 14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          transition: 'all .2s',
          boxShadow: '0 0 20px rgba(245,158,11,0.08)',
        }}
      >
        {!panelCollapsed && (
          <span
            style={{
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Simulation
            {changeCount > 0 && (
              <span style={{
                fontSize: 10,
                background: '#f59e0b',
                color: '#000',
                padding: '1px 6px',
                borderRadius: 8,
                fontWeight: 800,
                WebkitBackgroundClip: 'unset',
                WebkitTextFillColor: 'unset',
              }}>
                {changeCount}
              </span>
            )}
          </span>
        )}
        <span
          style={{
            fontSize: 18,
            lineHeight: 1,
            transition: 'transform .2s',
            transform: panelCollapsed ? 'rotate(180deg)' : '',
          }}
        >◀</span>
      </button>

      {!panelCollapsed && (
        <div
          style={{
            background: 'rgba(15,15,20,0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderTop: 'none',
            borderRadius: '0 0 14px 14px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(245,158,11,0.05)',
          }}
          className="custom-scrollbar"
        >
          {/* Exit button */}
          <div style={{ padding: '10px 14px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#71717a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Chế độ giả lập
            </span>
            <button
              onClick={onExitSimulation}
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#22c55e',
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 6,
                padding: '4px 10px',
                cursor: 'pointer',
                transition: 'all .15s',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              Quan sát
            </button>
          </div>

          {/* Target Time */}
          <div style={{
            padding: '8px 14px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#a1a1aa',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 6,
              display: 'block',
            }}>Thời điểm giả lập</span>
            <div style={{ position: 'relative' }}>
              <input
                type="datetime-local"
                value={scenario.targetTime}
                onChange={(e) => onSetTargetTime(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0,0,0,0.5)',
                  color: '#f4f4f5',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontSize: 13,
                  fontWeight: 500,
                  outline: 'none',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  cursor: 'pointer',
                  colorScheme: 'dark',
                  transition: 'all .15s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginTop: 8 }}>
              {quickPicks.slice(0, 6).map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => onSetTargetTime(qp.value)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: scenario.targetTime === qp.value ? '#f59e0b' : '#71717a',
                    background: scenario.targetTime === qp.value
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${scenario.targetTime === qp.value ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 6,
                    padding: '5px 4px',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >{qp.label}</button>
              ))}
            </div>
          </div>

          {/* Sections */}
          <WeatherSection
            weather={scenario.weatherOverride}
            onChange={onSetWeather}
            expanded={expandedSections.weather}
            onToggle={() => toggleSection('weather')}
          />

          <EventsSection
            events={scenario.virtualEvents}
            onAdd={onAddEvent}
            onRemove={onRemoveEvent}
            onUpdate={onUpdateEvent}
            expanded={expandedSections.events}
            onToggle={() => toggleSection('events')}
          />

          <FacilitiesSection
            closedFacilities={scenario.closedFacilities}
            onToggle={onToggleFacility}
            expanded={expandedSections.facilities}
            onToggleSection={() => toggleSection('facilities')}
          />

          <PopulationSection
            multiplier={scenario.userCountMultiplier}
            onChange={onSetMultiplier}
            expanded={expandedSections.population}
            onToggle={() => toggleSection('population')}
            baseTotal={result?.totalOnline}
          />

          {/* Error */}
          {error && (
            <div style={{
              margin: '0 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 11,
              color: '#fca5a5',
            }}>
              {error}
            </div>
          )}

          {/* Simulation Reasons */}
          {result?.simulationReasons && result.simulationReasons.length > 0 && (
            <div style={{
              margin: '8px 14px 0',
              background: 'rgba(245,158,11,0.06)',
              border: '1px solid rgba(245,158,11,0.12)',
              borderRadius: 8,
              padding: '8px 10px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                Kịch bản đã áp dụng:
              </div>
              {result.simulationReasons.map((r, i) => (
                <div key={i} style={{ fontSize: 11, color: '#a1a1aa', lineHeight: '16px', display: 'flex', gap: 4, alignItems: 'flex-start' }}>
                  <span style={{ color: '#f59e0b', fontSize: 8, marginTop: 4 }}>●</span> {r}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={onRunSimulation}
              disabled={loading}
              style={{
                width: '100%',
                fontSize: 13,
                fontWeight: 700,
                padding: '12px 0',
                borderRadius: 10,
                border: 'none',
                background: loading
                  ? 'rgba(245,158,11,0.2)'
                  : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: loading ? '#d97706' : '#000',
                cursor: loading ? 'wait' : 'pointer',
                transition: 'all .2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(245,158,11,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                letterSpacing: '-0.01em',
              }}
            >
              {loading ? (
                <>
                  <span className="custom-spinner" style={{
                    width: 16,
                    height: 16,
                    border: '2px solid transparent',
                    borderTopColor: '#f59e0b',
                    borderRadius: '50%',
                    display: 'inline-block',
                  }} />
                  Đang tính toán...
                </>
              ) : (
                <>Chạy giả lập</>
              )}
            </button>

            {hasChanges && (
              <button
                onClick={onResetAll}
                style={{
                  width: '100%',
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '8px 0',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: '#71717a',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                Đặt lại tất cả
              </button>
            )}
          </div>

          {/* Color Legend */}
          <div style={{ padding: '8px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#52525b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
              display: 'block',
            }}>Density Scale</span>
            <div style={{
              height: 10,
              borderRadius: 5,
              background: 'linear-gradient(90deg, #1e3cb4, #0096dc, #00c8a0, #50d264, #b4dc32, #ffdc00, #ff9600, #dc1e14)',
              opacity: 0.9,
            }} />
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
