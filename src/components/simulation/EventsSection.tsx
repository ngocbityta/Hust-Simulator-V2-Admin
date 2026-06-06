import React, { useState, useEffect } from 'react';
import type { VirtualEvent } from '../../types/simulation';
import { apiFetch } from '../../utils/api';
import { ChevronDown, CalendarDays, MapPin, Users, Clock, Plus, Pencil, Trash2 } from 'lucide-react';

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

  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-white/5 group"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-bold text-zinc-200 group-hover:text-zinc-50">
          Sự kiện giả lập
          {events.length > 0 && (
            <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full font-bold ml-1 border border-amber-500/20">
              {events.length}
            </span>
          )}
        </span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[600px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Event List */}
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 shadow-sm shadow-amber-500/5 group/event"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-zinc-50 mb-1 flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-amber-500" /> {ev.name}
                  </div>
                  <div className="text-[11px] font-medium text-zinc-400 flex flex-wrap gap-y-1 gap-x-3 items-center">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {ev.buildingName}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {ev.estimatedParticipants} người</span>
                  </div>
                  {ev.startTime && (
                    <div className="text-[10px] font-medium text-zinc-500 mt-1.5 flex items-center gap-1 bg-black/20 rounded-md px-2 py-1 w-fit border border-white/5">
                      <Clock size={10} /> {ev.startTime.replace('T', ' ')} → {ev.endTime?.replace('T', ' ')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 opacity-60 group-hover/event:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(ev)}
                    className="p-1.5 rounded-md border border-white/10 bg-white/5 text-zinc-400 cursor-pointer hover:bg-white/10 hover:text-zinc-200 transition-colors"
                  ><Pencil size={12} /></button>
                  <button
                    onClick={() => onRemove(ev.id)}
                    className="p-1.5 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 cursor-pointer hover:bg-red-500/20 transition-colors"
                  ><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}

          {/* Add/Edit Form */}
          {showForm ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex flex-col gap-3.5 mt-1 shadow-inner">
              <div className="text-[12px] font-bold text-amber-500 border-b border-white/5 pb-2">
                {editingId ? 'Sửa sự kiện' : 'Thêm sự kiện mới'}
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Tên sự kiện</span>
                <input
                  type="text"
                  placeholder="VD: Hội thảo AI"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none font-sans transition-colors focus:border-amber-500/50 focus:bg-black/60"
                />
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Tòa nhà</span>
                <select
                  value={formBuildingId}
                  onChange={(e) => setFormBuildingId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none font-sans transition-colors focus:border-amber-500/50 focus:bg-black/60 cursor-pointer"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Chọn tòa nhà...</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Số người tham gia</span>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={formParticipants}
                  onChange={(e) => setFormParticipants(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none font-sans transition-colors focus:border-amber-500/50 focus:bg-black/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Bắt đầu</span>
                  <input
                    type="datetime-local"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none font-sans transition-colors focus:border-amber-500/50 focus:bg-black/60"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5 block">Kết thúc</span>
                  <input
                    type="datetime-local"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[12px] text-zinc-200 outline-none font-sans transition-colors focus:border-amber-500/50 focus:bg-black/60"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-1">
                <button
                  onClick={handleSubmit}
                  disabled={!formName.trim() || !formBuildingId}
                  className={`flex-1 text-[12px] font-bold py-2.5 rounded-lg border-none transition-all duration-200 ${
                    formName.trim() && formBuildingId
                      ? 'bg-amber-500 hover:bg-amber-400 text-black cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {editingId ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  onClick={resetForm}
                  className="text-[12px] font-bold px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 cursor-pointer hover:bg-white/10 hover:text-white transition-colors"
                >Hủy</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full text-[12px] font-bold py-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-amber-500 cursor-pointer hover:bg-amber-500/15 hover:border-amber-500/60 transition-all duration-200 flex items-center justify-center gap-2 mt-1"
            >
              <Plus size={14} /> Thêm sự kiện giả lập
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
