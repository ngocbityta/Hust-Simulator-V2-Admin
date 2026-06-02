import type { PoiData } from '../types/heatmap';

interface BuildingDetailPanelProps {
  selectedPoi: PoiData;
  onClose: () => void;
  buildingDensity: Map<string, number>;
  globalReasons?: string[];
  poiReasons?: Record<string, string[]>;
}

import React from 'react';

export default React.memo(function BuildingDetailPanel({
  selectedPoi,
  onClose,
  buildingDensity,
  globalReasons,
  poiReasons,
}: BuildingDetailPanelProps) {
  const eventsForPoi: Array<{ name: string; count: number }> = [];
  let poiTotalDensity = buildingDensity.get(selectedPoi.name) || 0;

  for (const [key, count] of buildingDensity.entries()) {
    if (key.startsWith(`[Event|${selectedPoi.name}]`)) {
      const eventName = key.replace(`[Event|${selectedPoi.name}] `, '');
      eventsForPoi.push({ name: eventName, count });
      poiTotalDensity += count; // Add event phantom density to total
    }
  }

  const allReasons = [
    ...(poiReasons?.[selectedPoi.name] || []),
    ...(globalReasons || []),
    ...eventsForPoi.map(ev => `Đang diễn ra sự kiện: ${ev.name}`),
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
        width: 320,
        background: 'rgba(15,15,20,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                maxWidth: '240px',
              }}
            >
              <span 
                style={{ 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap' 
                }}
                title={selectedPoi.name}
              >
                {selectedPoi.name}
              </span>

            </div>
            <div style={{ fontSize: 10, color: '#52525b', marginTop: 2, fontFamily: 'monospace' }}>
              {selectedPoi.lat.toFixed(5)}, {selectedPoi.lng.toFixed(5)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div
          style={{
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: 10,
            padding: '10px 12px',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: '#38bdf8',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Số lượng người dự kiến
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
            {(() => {
              const rounded = Math.round(poiTotalDensity * 10) / 10;
              const lower = Math.floor(rounded);
              const upper = Math.ceil(rounded);
              return lower === upper ? `${lower}` : `Khoảng ${lower}-${upper}`;
            })()}
          </div>
          <div style={{ fontSize: 9, color: '#52525b' }}>người</div>
        </div>

        {allReasons.length > 0 && (
          <div style={{ marginTop: 8, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>Nguyên nhân:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {allReasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 13, lineHeight: '16px' }}>✓</span>
                  <span style={{ fontSize: 12, color: '#a1a1aa', lineHeight: '16px' }}>{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
