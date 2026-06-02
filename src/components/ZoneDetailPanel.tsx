import React from 'react';
import type { CellData } from '../types/heatmap';

interface ZoneDetailPanelProps {
  selectedCell: CellData;
  onClose: () => void;
}

export default React.memo(function ZoneDetailPanel({ selectedCell, onClose }: ZoneDetailPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 10,
        width: 320,
        maxHeight: 400,
        background: 'rgba(15,15,20,0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px 10px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fafafa' }}>Zone Detail</div>
          <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 2 }}>
            Expected: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{selectedCell.count.toFixed(1)}</span> people
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
            transition: 'all .15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.color = '#fafafa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.color = '#71717a';
          }}
        >
          ✕
        </button>
      </div>

      {/* Building list */}
      <div style={{ padding: '8px 12px 14px', overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
        {Object.entries(selectedCell.intents)
          .sort(([, a], [, b]) => b - a)
          .map(([poi, count]) => {
            const pct = selectedCell.count > 0 ? (count / selectedCell.count) * 100 : 0;
            return (
              <div
                key={poi}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 8px',
                  marginBottom: 4,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                  transition: 'background .15s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Mini bar */}
                <div
                  style={{
                    width: 4,
                    height: 22,
                    borderRadius: 2,
                    background: `hsl(${160 - pct * 1.4}, 70%, 55%)`,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#d4d4d8',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={poi}
                  >
                    {poi}
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fafafa', flexShrink: 0 }}>
                  {count.toFixed(1)}
                </div>
                <div style={{ fontSize: 10, color: '#71717a', width: 36, textAlign: 'right', flexShrink: 0 }}>
                  {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        {Object.keys(selectedCell.intents).length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#3f3f46', fontSize: 12 }}>
            No predicted destinations in this zone
          </div>
        )}
      </div>
    </div>
  );
});
