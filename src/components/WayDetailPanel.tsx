import { X } from 'lucide-react';
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
    <div className="absolute bottom-5 right-5 z-10 w-80 bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[15px] font-bold text-zinc-50 mb-1 tracking-tight">
              {selectedWay.name || 'Unnamed Way'}
            </div>
            <div className="text-[13px] text-zinc-400">
              Đường đi ({selectedWay.wayType})
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 border-none text-zinc-400 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:text-zinc-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-zinc-400">Chiều dài</span>
          <span className="text-[14px] font-semibold text-zinc-200">
            {Math.round(selectedWay.distanceMeters || 0)} m
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-zinc-400">Mật độ rải (Toàn tuyến)</span>
          <span className="text-[14px] font-semibold text-emerald-500">
            ~ {Math.round(wayDensity)}
          </span>
        </div>
      </div>
    </div>
  );
}
