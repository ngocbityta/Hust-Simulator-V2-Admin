import type { PoiData } from '../types/heatmap';

interface BuildingDetailPanelProps {
  selectedPoi: PoiData;
  onClose: () => void;
  buildingDensity: Map<string, number>;
  globalReasons?: string[];
  poiReasons?: Record<string, string[]>;
}

import React from 'react';
import { useFetch } from '../hooks/useFetch';

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

  const { data: buildingData } = useFetch<any>(`/buildings/${selectedPoi.id}`);

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
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Building Image Cover */}
      <div style={{ width: '100%', height: 140, position: 'relative', backgroundColor: '#18181b' }}>
        {selectedPoi.id === 'empty-space-click' ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27272a', color: '#a1a1aa', fontSize: 18, fontWeight: 600 }}>
            Bãi đất trống
          </div>
        ) : (
          <img 
            src={`https://picsum.photos/seed/${selectedPoi.id}/320/140`} 
            alt={selectedPoi.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/320x140/18181b/52525b?text=No+Image';
            }}
          />
        )}
        {/* Gradient overlay to make text more readable if we ever put text over it, and to blend with panel */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, rgba(15,15,20,1) 0%, rgba(15,15,20,0.4) 60%, transparent 100%)' 
        }} />
        
        {/* Close Button overlaying the image */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(15,15,20,0.6)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#e4e4e7',
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(15,15,20,0.8)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(15,15,20,0.6)'}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '0 16px 16px 16px', position: 'relative', marginTop: '-20px', zIndex: 5 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                maxWidth: '280px',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
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

        {buildingData && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 4 }}>Số tầng</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fafafa' }}>{buildingData.floorCount || 0}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#a1a1aa', marginBottom: 4 }}>Số phòng</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fafafa' }}>{buildingData.roomCount || 0}</div>
            </div>
          </div>
        )}


        {/* ── Dynamic AI model predicting overlay ── */}
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
