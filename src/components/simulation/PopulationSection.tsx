import React from 'react';
import { ChevronDown, Users } from 'lucide-react';

interface PopulationSectionProps {
  multiplier: number;
  onChange: (val: number) => void;
  expanded: boolean;
  onToggle: () => void;
  baseTotal?: number | null;
}

export default React.memo(function PopulationSection({
  multiplier,
  onChange,
  expanded,
  onToggle,
  baseTotal,
}: PopulationSectionProps) {
  const isModified = multiplier !== 1.0;
  const estimatedTotal = baseTotal != null ? Math.round(baseTotal * multiplier) : null;

  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-white/5 group"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-bold text-zinc-200 group-hover:text-zinc-50">
          Mật độ người
          {isModified && (
            <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full font-bold ml-1 border border-amber-500/20">
              x{multiplier.toFixed(1)}
            </span>
          )}
        </span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[250px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4 flex flex-col gap-4">
          
          {/* Multiplier display */}
          <div className="text-center bg-white/5 border border-white/10 rounded-2xl py-4 shadow-inner relative overflow-hidden">
            {isModified && (
              <div className="absolute inset-0 bg-amber-500/5" />
            )}
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users size={14} className={isModified ? 'text-amber-500' : 'text-zinc-500'} />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hệ số mật độ</span>
              </div>
              <div className={`text-3xl font-extrabold font-mono tracking-tighter transition-colors duration-300 ${isModified ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-zinc-300'}`}>
                {multiplier.toFixed(1)}x
              </div>
              {estimatedTotal !== null && (
                <div className="text-[12px] font-medium text-zinc-400 mt-1">
                  ≈ {estimatedTotal} người dự kiến
                </div>
              )}
            </div>
          </div>

          {/* Slider */}
          <div className="px-1">
            <input
              type="range"
              min={0.1}
              max={3.0}
              step={0.1}
              value={multiplier}
              onChange={(e) => onChange(Number(e.target.value))}
              className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer bg-gradient-to-r from-zinc-700 via-amber-500 to-red-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <div className="flex justify-between mt-2 px-1">
              <span className="text-[10px] font-bold text-zinc-600">0.1x</span>
              <span
                className="text-[10px] font-bold text-zinc-400 cursor-pointer hover:text-amber-500 transition-colors border-b border-dashed border-zinc-600 hover:border-amber-500"
                onClick={() => onChange(1.0)}
              >1.0x (Mặc định)</span>
              <span className="text-[10px] font-bold text-zinc-600">3.0x</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2">
            {[0.5, 1.0, 1.5, 2.0, 3.0].map((val) => (
              <button
                key={val}
                onClick={() => onChange(val)}
                className={`flex-1 text-[12px] font-bold py-2 rounded-xl border transition-all duration-200 ${
                  multiplier === val 
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                }`}
              >{val}x</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
