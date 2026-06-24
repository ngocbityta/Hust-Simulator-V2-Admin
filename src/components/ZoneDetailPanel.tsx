import React from 'react';
import type { CellData } from '../types/heatmap';
import { X } from 'lucide-react';

interface ZoneDetailPanelProps {
  selectedCell: CellData;
  onClose: () => void;
}

export default React.memo(function ZoneDetailPanel({ selectedCell, onClose }: ZoneDetailPanelProps) {
  return (
    <div className="absolute bottom-6 right-6 z-10 w-80 max-h-[400px] bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-white/5 flex justify-between items-start">
        <div>
          <div className="text-[15px] font-bold text-zinc-50 tracking-wide">Chi tiết Khu vực</div>
          <div className="text-xs text-zinc-400 mt-1">
            Dự kiến: <span className="text-sky-400 font-bold">{selectedCell.count.toFixed(1)}</span> người
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-400 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:text-zinc-50 cursor-pointer"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Building list */}
      <div className="px-3 pt-3 pb-4 overflow-y-auto flex-1 custom-scrollbar space-y-1">
        {Object.entries(selectedCell.intents || selectedCell.activities || {})
          .sort(([, a], [, b]) => b - a)
          .map(([poi, count]) => {
            const pct = selectedCell.count > 0 ? (count / selectedCell.count) * 100 : 0;
            return (
              <div
                key={poi}
                className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 transition-colors duration-200 hover:bg-white/10 hover:border-white/10 cursor-default group"
              >
                {/* Mini bar */}
                <div
                  className="w-1.5 h-6 rounded-full shrink-0 transition-colors duration-200"
                  style={{ background: `hsl(${160 - pct * 1.4}, 70%, 55%)` }}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[13px] font-medium text-zinc-300 whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-zinc-100 transition-colors"
                    title={poi}
                  >
                    {poi}
                  </div>
                </div>
                <div className="text-[13px] font-bold text-zinc-50 shrink-0">
                  {count.toFixed(1)}
                </div>
                <div className="text-[11px] text-zinc-500 w-10 text-right shrink-0 group-hover:text-zinc-400 transition-colors">
                  {pct.toFixed(0)}%
                </div>
              </div>
            );
          })}
        {Object.keys(selectedCell.intents || selectedCell.activities || {}).length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-[13px]">
            Không có dữ liệu chi tiết
          </div>
        )}
      </div>
    </div>
  );
});
