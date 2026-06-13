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
    <div className="absolute bottom-6 right-6 z-10 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
      {/* Building Image Cover */}
      <div className="w-full h-40 relative bg-zinc-900 group">
        {selectedPoi.id === 'empty-space-click' ? (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 text-lg font-bold">
            Bãi đất trống
          </div>
        ) : (
          <img 
            src={`https://picsum.photos/seed/${selectedPoi.id}/320/160`} 
            alt={selectedPoi.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/320x160/18181b/52525b?text=No+Image';
            }}
          />
        )}
        {/* Gradient overlay to make text more readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-950/60 backdrop-blur-md border border-white/10 text-zinc-200 cursor-pointer flex items-center justify-center z-10 transition-colors hover:bg-zinc-950/80"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      <div className="px-5 pb-5 relative -mt-6 z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xl font-bold text-zinc-50 flex items-center gap-2 max-w-[260px] drop-shadow-md">
              <span className="truncate" title={selectedPoi.name}>
                {selectedPoi.name}
              </span>
            </div>
            <div className="text-xs text-zinc-500 mt-1 font-mono">
              {selectedPoi.lat.toFixed(5)}, {selectedPoi.lng.toFixed(5)}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 flex flex-col gap-3">
        <div className="bg-sky-400/10 border border-sky-400/20 rounded-2xl p-4">
          <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
            Số lượng người dự kiến
          </div>
          <div className="text-3xl font-extrabold text-sky-400 mt-1">
            {(() => {
              const rounded = Math.round(poiTotalDensity * 10) / 10;
              const lower = Math.floor(rounded);
              const upper = Math.ceil(rounded);
              return lower === upper ? `${lower}` : `~${lower}-${upper}`;
            })()}
          </div>
          <div className="text-xs text-zinc-400 mt-1 font-medium">người</div>
        </div>

        {buildingData && (
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xs text-zinc-400 mb-1 font-medium">Số tầng</div>
              <div className="text-xl font-bold text-zinc-100">{buildingData.floorCount || 0}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
              <div className="text-xs text-zinc-400 mb-1 font-medium">Số phòng</div>
              <div className="text-xl font-bold text-zinc-100">{buildingData.roomCount || 0}</div>
            </div>
          </div>
        )}

        {/* ── Dynamic AI model predicting overlay ── */}
        {allReasons.length > 0 && (
          <div className="mt-2 p-4 bg-white/5 rounded-2xl border border-white/10">
            <div className="text-[13px] font-bold text-zinc-200 mb-3">Nguyên nhân:</div>
            <div className="flex flex-col gap-2.5">
              {allReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-emerald-500 text-sm mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                  <span className="text-[13px] text-zinc-400 leading-tight">{r}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
