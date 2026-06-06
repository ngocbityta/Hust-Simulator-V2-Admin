import React, { useState, useEffect, useMemo } from 'react';
import type { ClosedFacility } from '../../types/simulation';
import { apiFetch } from '../../utils/api';
import { ChevronDown, Building2, ParkingCircle, DoorOpen, Search, Lock, CheckCircle2 } from 'lucide-react';

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
    <div className="border-b border-white/5">
      <button
        onClick={onToggleSection}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-white/5 group"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-bold text-zinc-200 group-hover:text-zinc-50">
          Cơ sở vật chất
          {closedCount > 0 && (
            <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-bold ml-1 border border-red-500/20">
              {closedCount} đóng
            </span>
          )}
        </span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[450px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4 flex flex-col gap-3.5">
          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 p-1 bg-black/40">
            {[
              { key: 'building' as const, label: 'Tòa nhà' },
              { key: 'node' as const, label: 'Cổng & Nhà xe' },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 text-[12px] font-bold py-1.5 border-none transition-all duration-200 rounded-lg ${
                  tab === t.key 
                    ? 'bg-amber-500/15 text-amber-500 shadow-sm' 
                    : 'bg-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                }`}
              >{t.label}</button>
            ))}
          </div>

          {/* Search */}
          <div className="relative group">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-focus-within:text-amber-500 transition-colors">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pr-3 pl-9 text-[12px] font-medium text-zinc-200 outline-none transition-all duration-200 focus:border-amber-500/50 focus:bg-black/60 focus:shadow-[0_0_10px_rgba(245,158,11,0.1)]"
            />
          </div>

          {/* Facility List */}
          <div
            className="max-h-[240px] overflow-y-auto flex flex-col gap-1.5 custom-scrollbar pr-1"
          >
            {filtered.map((f) => {
              const isClosed = closedIds.has(f.id);
              const Icon = f.type === 'gate' ? DoorOpen : f.type === 'parking' ? ParkingCircle : Building2;
              
              return (
                <button
                  key={f.id}
                  onClick={() => onToggle({ id: f.id, name: f.name, type: f.type })}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 w-full text-left group ${
                    isClosed 
                      ? 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className={`flex items-center gap-2 overflow-hidden ${
                    isClosed ? 'text-red-400 opacity-80' : 'text-zinc-300'
                  }`}>
                    <Icon size={14} className={isClosed ? 'text-red-400' : 'text-zinc-500 group-hover:text-zinc-300'} />
                    <span className={`text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap ${
                      isClosed ? 'line-through' : ''
                    }`}>
                      {f.name}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-6 ml-2">
                    {isClosed ? (
                      <Lock size={14} className="text-red-500" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-6 text-zinc-500 text-[12px] font-medium bg-white/5 rounded-xl border border-white/5 border-dashed">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
