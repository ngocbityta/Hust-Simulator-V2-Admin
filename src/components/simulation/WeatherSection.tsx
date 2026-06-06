import React from 'react';
import type { WeatherOverride } from '../../types/simulation';
import { Sun, CloudRain, CloudLightning, Snowflake, Flame, Thermometer, Droplets, ChevronDown } from 'lucide-react';

interface WeatherSectionProps {
  weather: WeatherOverride | null;
  onChange: (weather: WeatherOverride | null) => void;
  expanded: boolean;
  onToggle: () => void;
}

const PRESETS: Array<{ label: string; icon: React.ElementType; temp: number; rain: number; colorClass: string }> = [
  { label: 'Nắng đẹp', icon: Sun, temp: 30, rain: 0, colorClass: 'text-amber-400' },
  { label: 'Mưa nhẹ', icon: CloudRain, temp: 25, rain: 1.5, colorClass: 'text-sky-300' },
  { label: 'Mưa to', icon: CloudLightning, temp: 22, rain: 8, colorClass: 'text-indigo-400' },
  { label: 'Trời lạnh', icon: Snowflake, temp: 12, rain: 0, colorClass: 'text-blue-300' },
  { label: 'Nóng nực', icon: Flame, temp: 40, rain: 0, colorClass: 'text-red-500' },
];

export default React.memo(function WeatherSection({
  weather,
  onChange,
  expanded,
  onToggle,
}: WeatherSectionProps) {
  const temp = weather?.temp ?? 28;
  const rain = weather?.rain ?? 0;

  const handleTempChange = (val: number) => {
    onChange({ temp: val, rain });
  };
  const handleRainChange = (val: number) => {
    onChange({ temp, rain: val });
  };

  return (
    <div className="border-b border-white/5">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-white/5 group"
      >
        <span className="flex items-center gap-2.5 text-[13px] font-bold text-zinc-200 group-hover:text-zinc-50">
          Thời tiết
          {weather && (
            <span className="text-[10px] bg-amber-500/15 text-amber-500 px-2 py-0.5 rounded-full font-bold ml-1 border border-amber-500/20">
              Đã chỉnh
            </span>
          )}
        </span>
        <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-[350px]' : 'max-h-0'}`}>
        <div className="px-4 pb-4 flex flex-col gap-4">
          
          {/* Temperature Slider */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] text-zinc-400 font-bold tracking-wide flex items-center gap-1.5 uppercase">
                <Thermometer size={12} /> Nhiệt độ
              </span>
              <span className={`text-[13px] font-bold font-mono ${temp > 35 ? 'text-red-500' : temp < 15 ? 'text-sky-400' : 'text-amber-500'}`}>
                {temp}°C
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={45}
              step={1}
              value={temp}
              onChange={(e) => handleTempChange(Number(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer bg-gradient-to-r from-sky-400 via-green-500 via-amber-500 to-red-500 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-medium text-zinc-600">5°C</span>
              <span className="text-[10px] font-medium text-zinc-600">45°C</span>
            </div>
          </div>

          {/* Rain Slider */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] text-zinc-400 font-bold tracking-wide flex items-center gap-1.5 uppercase">
                <Droplets size={12} /> Lượng mưa
              </span>
              <span className={`text-[13px] font-bold font-mono ${rain > 5 ? 'text-sky-400' : rain > 0 ? 'text-indigo-400' : 'text-zinc-500'}`}>
                {rain.toFixed(1)}mm
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              step={0.5}
              value={rain}
              onChange={(e) => handleRainChange(Number(e.target.value))}
              className="w-full h-1.5 appearance-none rounded-full outline-none cursor-pointer bg-gradient-to-r from-zinc-700 via-indigo-400 to-sky-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] font-medium text-zinc-600">0mm</span>
              <span className="text-[10px] font-medium text-zinc-600">15mm</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const isActive = weather && weather.temp === p.temp && weather.rain === p.rain;
              const Icon = p.icon;
              return (
                <button
                  key={p.label}
                  onClick={() => onChange({ temp: p.temp, rain: p.rain })}
                  className={`flex items-center gap-1.5 text-[11px] font-bold py-1.5 px-3 rounded-lg border transition-all duration-200 ${
                    isActive 
                      ? 'border-amber-500/50 bg-amber-500/15 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]' 
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={12} className={isActive ? 'text-amber-500' : p.colorClass} /> 
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Reset Button */}
          {weather && (
            <button
              onClick={() => onChange(null)}
              className="w-full text-[12px] font-bold text-zinc-400 bg-white/5 border border-white/10 rounded-xl py-2.5 mt-1 transition-all duration-200 hover:bg-white/10 hover:text-zinc-200"
            >
              Dùng thời tiết thực
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
