import React, { useState, useEffect } from 'react';
import type { VirtualEvent } from '../../types/simulation';
import { apiFetch } from '../../utils/api';

interface EventsSectionProps {
  events: VirtualEvent[];
  onAdd: (event: VirtualEvent) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<VirtualEvent>) => void;
  expanded: boolean;
  onToggle: () => void;
}

interface BuildingOption {
  id: string;
  name: string;
}

export default React.memo(function EventsSection({
  events,
  onAdd,
  onRemove,
  onUpdate,
  expanded,
  onToggle,
}: EventsSectionProps) {
  const [buildings, setBuildings] = useState<BuildingOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formBuildingId, setFormBuildingId] = useState('');
  const [formParticipants, setFormParticipants] = useState(100);
  const [formStart, setFormStart] = useState('');
  const [formEnd, setFormEnd] = useState('');

  useEffect(() => {
    apiFetch('/buildings/active')
      .then((data: Array<{ id: string; name: string }>) => {
        setBuildings(data.map((b) => ({ id: b.id, name: b.name })));
      })
      .catch(() => {});
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormBuildingId('');
    setFormParticipants(100);
    setFormStart('');
    setFormEnd('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formName.trim() || !formBuildingId) return;

    const building = buildings.find((b) => b.id === formBuildingId);
    if (!building) return;

    if (editingId) {
      onUpdate(editingId, {
        name: formName,
        buildingId: formBuildingId,
        buildingName: building.name,
        estimatedParticipants: formParticipants,
        startTime: formStart,
        endTime: formEnd,
      });
    } else {
      onAdd({
        id: crypto.randomUUID(),
        name: formName,
        buildingId: formBuildingId,
        buildingName: building.name,
        estimatedParticipants: formParticipants,
        startTime: formStart,
        endTime: formEnd,
      });
    }
    resetForm();
  };

  const handleEdit = (ev: VirtualEvent) => {
    setFormName(ev.name);
    setFormBuildingId(ev.buildingId);
    setFormParticipants(ev.estimatedParticipants);
    setFormStart(ev.startTime);
    setFormEnd(ev.endTime);
    setEditingId(ev.id);
    setShowForm(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '8px 10px',
    fontSize: 12,
    color: '#e4e4e7',
    outline: 'none',
    fontFamily: 'Inter, system-ui, sans-serif',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: 4,
    display: 'block',
  };

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
          Sự kiện giả lập
          {events.length > 0 && (
            <span style={{
              fontSize: 10,
              background: 'rgba(245,158,11,0.15)',
              color: '#f59e0b',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 700,
            }}>
              {events.length}
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
        maxHeight: expanded ? 600 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Event List */}
          {events.map((ev) => (
            <div
              key={ev.id}
              style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fafafa' }}>{ev.name}</div>
                  <div style={{ fontSize: 10, color: '#a1a1aa', marginTop: 2 }}>
                    📍 {ev.buildingName} · 👥 {ev.estimatedParticipants} người
                  </div>
                  {ev.startTime && (
                    <div style={{ fontSize: 10, color: '#71717a', marginTop: 1 }}>
                      🕐 {ev.startTime.replace('T', ' ')} → {ev.endTime?.replace('T', ' ')}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={() => handleEdit(ev)}
                    style={{
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.05)',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                    }}
                  >Sửa</button>
                  <button
                    onClick={() => onRemove(ev.id)}
                    style={{
                      fontSize: 10,
                      padding: '3px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(239,68,68,0.2)',
                      background: 'rgba(239,68,68,0.08)',
                      color: '#f87171',
                      cursor: 'pointer',
                    }}
                  >Xóa</button>
                </div>
              </div>
            </div>
          ))}

          {/* Add/Edit Form */}
          {showForm ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>
                {editingId ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}
              </div>

              <div>
                <span style={labelStyle}>Tên sự kiện</span>
                <input
                  type="text"
                  placeholder="VD: Hội thảo AI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <span style={labelStyle}>Tòa nhà</span>
                <select
                  value={formBuildingId}
                  onChange={(e) => setFormBuildingId(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}
                >
                  <option value="">Chọn tòa nhà...</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span style={labelStyle}>Số người tham gia</span>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={formParticipants}
                  onChange={(e) => setFormParticipants(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <span style={labelStyle}>Bắt đầu</span>
                  <input
                    type="datetime-local"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <span style={labelStyle}>Kết thúc</span>
                  <input
                    type="datetime-local"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleSubmit}
                  disabled={!formName.trim() || !formBuildingId}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '8px 0',
                    borderRadius: 8,
                    border: 'none',
                    background: formName.trim() && formBuildingId
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'rgba(255,255,255,0.06)',
                    color: formName.trim() && formBuildingId ? '#000' : '#52525b',
                    cursor: formName.trim() && formBuildingId ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s',
                  }}
                >
                  {editingId ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '8px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'transparent',
                    color: '#71717a',
                    cursor: 'pointer',
                  }}
                >Hủy</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              style={{
                width: '100%',
                fontSize: 12,
                fontWeight: 600,
                padding: '10px 0',
                borderRadius: 8,
                border: '1px dashed rgba(245,158,11,0.3)',
                background: 'rgba(245,158,11,0.04)',
                color: '#f59e0b',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              Thêm sự kiện giả lập
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
