import React, { useState, useEffect, useMemo } from 'react';
import type { ClosedFacility } from '../../types/simulation';
import { apiFetch } from '../../utils/api';

interface FacilitiesSectionProps {
  closedFacilities: ClosedFacility[];
  onToggle: (facility: ClosedFacility) => void;
  expanded: boolean;
  onToggleSection: () => void;
}

interface FacilityItem {
  id: string;
  name: string;
  type: 'building' | 'parking' | 'gate';
  category?: string;
}

export default React.memo(function FacilitiesSection({
  closedFacilities,
  onToggle,
  expanded,
  onToggleSection,
}: FacilitiesSectionProps) {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'building' | 'node'>('building');

  useEffect(() => {
    const loadAll = async () => {
      const items: FacilityItem[] = [];
      try {
        const buildings = await apiFetch('/buildings/active');
        for (const b of buildings) {
          if (b.category !== 'PLAZA') {
            items.push({ id: b.id, name: b.name, type: 'building', category: b.category });
          }
        }
      } catch {}
      try {
        const nodes = await apiFetch('/campus-nodes');
        for (const n of nodes) {
          if (n.nodeType === 'GATE') {
            items.push({ id: n.id, name: n.name, type: 'gate' });
          } else if (n.nodeType === 'PARKING') {
            items.push({ id: n.id, name: n.name, type: 'parking' });
          }
        }
      } catch {}
      setFacilities(items);
    };
    loadAll();
  }, []);

  const closedIds = useMemo(() => new Set(closedFacilities.map((f) => f.id)), [closedFacilities]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return facilities.filter((f) => {
      const matchesTab = tab === 'building' ? f.type === 'building' : f.type !== 'building';
      const matchesSearch = !q || f.name.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [facilities, search, tab]);

  const closedCount = closedFacilities.length;

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={onToggleSection}
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
          Cơ sở vật chất
          {closedCount > 0 && (
            <span style={{
              fontSize: 10,
              background: 'rgba(239,68,68,0.15)',
              color: '#f87171',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 700,
            }}>
              {closedCount} đóng
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
        maxHeight: expanded ? 400 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { key: 'building' as const, label: 'Tòa nhà' },
              { key: 'node' as const, label: 'Cổng & Nhà xe' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '7px 0',
                  border: 'none',
                  background: tab === t.key ? 'rgba(245,158,11,0.15)' : 'transparent',
                  color: tab === t.key ? '#f59e0b' : '#71717a',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >{t.label}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 12,
              color: '#52525b',
              pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '7px 10px 7px 30px',
                fontSize: 12,
                color: '#e4e4e7',
                outline: 'none',
              }}
            />
          </div>

          {/* Facility List */}
          <div
            style={{ maxHeight: 220, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}
            className="custom-scrollbar"
          >
            {filtered.map((f) => {
              const isClosed = closedIds.has(f.id);
              return (
                <button
                  key={f.id}
                  onClick={() => onToggle({ id: f.id, name: f.name, type: f.type })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: `1px solid ${isClosed ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.05)'}`,
                    background: isClosed ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    width: '100%',
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    color: isClosed ? '#f87171' : '#d4d4d8',
                    fontWeight: 500,
                    textDecoration: isClosed ? 'line-through' : 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 220,
                  }}>
                    {f.type === 'gate' ? '🚪 ' : f.type === 'parking' ? '🅿️ ' : ''}{f.name}
                  </span>
                  <span style={{
                    fontSize: 16,
                    flexShrink: 0,
                    width: 28,
                    textAlign: 'center',
                    transition: 'transform 0.2s',
                  }}>
                    {isClosed ? '🔒' : '✅'}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#52525b', fontSize: 11 }}>
                Không tìm thấy
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
