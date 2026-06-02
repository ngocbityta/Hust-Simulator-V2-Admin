import type { WayData } from '../types/heatmap';

interface WayDetailPanelProps {
  selectedWay: WayData;
  onClose: () => void;
  buildingDensity: Map<string, number>;
}

export default function WayDetailPanel({
  selectedWay,
  onClose,
  buildingDensity,
}: WayDetailPanelProps) {
  const wayDensity = buildingDensity.get('[Transit] Trên đường') || 0;

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
                color: '#fff',
                marginBottom: 4,
                letterSpacing: '-0.01em',
              }}
            >
              {selectedWay.name || 'Unnamed Way'}
            </div>
            <div style={{ fontSize: 13, color: '#a1a1aa' }}>
              Đường đi ({selectedWay.wayType})
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '50%',
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a1a1aa',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            ×
          </button>
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#a1a1aa' }}>Chiều dài</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7' }}>
            {Math.round(selectedWay.distanceMeters || 0)} m
          </span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#a1a1aa' }}>Mật độ rải (Toàn tuyến)</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>
            ~ {Math.round(wayDensity)}
          </span>
        </div>
      </div>
    </div>
  );
}
