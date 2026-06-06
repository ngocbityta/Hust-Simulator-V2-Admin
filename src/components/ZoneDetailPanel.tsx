import React from 'react';
import type { CellData } from '../types/heatmap';
import { X } from 'lucide-react';

interface ZoneDetailPanelProps {
  selectedCell: CellData;
  onClose: () => void;
}

export default React.memo(function ZoneDetailPanel({ selectedCell, onClose }: ZoneDetailPanelProps) {
  return (
    <div className="absolute bottom-5 right-5 z-10 w-80 max-h-[400px] bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2.5 border-b border-white/10 flex justify-between items-start">
        <div>
          <div className="text-sm font-bold text-zinc-50">Zone Detail</div>
          <div className="text-[11px] text-zinc-400 mt-0.5">
            Expected: <span className="text-sky-400 font-bold">{selectedCell.count.toFixed(1)}</span> people
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/5 border-none text-zinc-400 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:text-zinc-50"
        >
          <X size={16} />
        </button>
      </div>

      {/* Building list */}
      <div className="px-3 pt-2 pb-3.5 overflow-y-auto flex-1 custom-scrollbar">
        {Object.entries(selectedCell.intents)
          .sort(([, a], [, b]) => b - a)
          .map(([poi, count]) => {
            const pct = selectedCell.count > 0 ? (count / selectedCell.count) * 100 : 0;
            return (
              <div
                key={poi}
                className="flex items-center gap-2 px-2 py-1.5 mb-1 rounded-lg bg-white/5 transition-colors duration-200 hover:bg-white/10 cursor-default group"
              >
                {/* Mini bar */}
                <div
                  className="w-1 h-5 rounded-sm shrink-0 transition-colors duration-200"
                  style={{ background: `hsl(${160 - pct * 1.4}, 70%, 55%)` }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-medium text-zinc-300 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-zinc-100 transition-colors"
                    title={poi}
                  >
                    {poi}
                  </div>
                </div>
                <div className="text-xs font-bold text-zinc-50 shrink-0">
                  {count.toFixed(1)}
                </div>
                <div className="text-[10px] text-zinc-500 w-9 text-right shrink-0 group-hover:text-zinc-400 transition-colors">
                  {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        {Object.keys(selectedCell.intents).length === 0 && (
          <div className="text-center py-6 text-zinc-600 text-xs">
            No predicted destinations in this zone
          </div>
        )}
      </div>
    </div>
  );
});
