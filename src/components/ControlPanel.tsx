import type { ConnectionStatus, QuickPickItem } from '../types/heatmap';
import { STATUS_COLOR, STATUS_LABEL } from '../constants/heatmap';
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

interface ControlPanelProps {
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
  connStatus: ConnectionStatus;
  lastUpdated: Date | null;
  errorMsg: string | null;
  isLive: boolean;
  targetDateStr: string;
  setTargetDateStr: (dateStr: string) => void;
  quickPicks: QuickPickItem[];
}

export default React.memo(function ControlPanel({
  panelCollapsed,
  setPanelCollapsed,
  connStatus,
  lastUpdated,
  errorMsg,
  isLive,
  targetDateStr,
  setTargetDateStr,
  quickPicks,
}: ControlPanelProps) {
  return (
    <div
      className={`absolute top-4 left-4 z-10 flex flex-col select-none transition-all duration-300 ease-out ${panelCollapsed ? 'w-[52px]' : 'w-[320px]'}`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        className={`flex items-center justify-between gap-2 px-3.5 py-2.5 bg-black/70 dark:bg-black/60 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-black/80 transition-all duration-300 shadow-lg cursor-pointer ${panelCollapsed ? 'rounded-2xl' : 'rounded-t-2xl'}`}
      >
        {!panelCollapsed && (
          <span className="font-extrabold text-[15px] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400 drop-shadow-sm">
            Crowd Analytics
          </span>
        )}
        <span
          className={`text-lg transition-transform duration-300 ${panelCollapsed ? 'rotate-180 text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
        >
          {panelCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </span>
      </button>

      {!panelCollapsed && (
        <div className="bg-black/70 dark:bg-black/60 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl p-4 flex flex-col gap-4 shadow-xl">
          {/* Connection Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] ${connStatus === 'live' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: STATUS_COLOR[connStatus], color: STATUS_COLOR[connStatus] }}
            />
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: STATUS_COLOR[connStatus] }}
            >
              {STATUS_LABEL[connStatus]}
            </span>
            <span className="ml-auto text-[10px] text-zinc-500 font-medium">
              {lastUpdated?.toLocaleTimeString() ?? '—'}
            </span>
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2.5 text-[11px] text-red-300 leading-relaxed shadow-inner">
              <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                <AlertTriangle size={14} /> API Predict Error
              </div>
              {errorMsg}
            </div>
          )}

          {/* Divider */}
          <div className="h-px w-full bg-white/10" />

          {/* Time Picker Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="flex justify-between items-center mb-3">
              {!isLive && (
                <button
                  onClick={() => setTargetDateStr('')}
                  className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 transition-all duration-300 hover:bg-emerald-500/20 hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] shadow-[0_0_8px_rgba(16,185,129,0.1)] flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> GO LIVE
                </button>
              )}
            </div>

            {/* datetime-local input */}
            <div className="relative group">
              <input
                type="datetime-local"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
                className="w-full bg-black/60 text-zinc-100 border border-violet-400/30 rounded-lg px-3 py-2.5 text-sm font-medium outline-none transition-all duration-300 cursor-pointer shadow-inner hover:border-violet-400/50 focus:border-violet-400 focus:shadow-[0_0_0_2px_rgba(167,139,250,0.2),inset_0_2px_4px_rgba(0,0,0,0.5)] appearance-none"
                style={{ colorScheme: 'dark' }}
              />
              <div className="absolute top-0 right-0 h-full w-10 flex items-center justify-center pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                <Calendar size={16} className="text-violet-400" />
              </div>
            </div>

            {/* Quick-pick chips */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {quickPicks.map((qp) => {
                const isActive = targetDateStr === qp.value;
                return (
                  <button
                    key={qp.label}
                    onClick={() => setTargetDateStr(qp.value)}
                    className={`
                      text-[11px] font-semibold rounded-lg px-2 py-1.5 transition-all duration-300 border
                      ${isActive 
                        ? 'text-white bg-gradient-to-br from-violet-500/40 to-purple-600/40 border-violet-400/50 shadow-[0_4px_12px_rgba(139,92,246,0.3)]' 
                        : 'text-zinc-400 bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-zinc-200'
                      }
                    `}
                  >
                    {qp.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-white/10" />

          {/* Color Legend */}
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 block">
              Density Scale
            </span>
            <div
              className="h-2.5 rounded-full opacity-90 shadow-inner"
              style={{
                background: 'linear-gradient(90deg, #1e3cb4, #0096dc, #00c8a0, #50d264, #b4dc32, #ffdc00, #ff9600, #dc1e14)',
              }}
            />
            <div className="flex justify-between mt-1 px-0.5">
              <span className="text-[9px] font-medium text-zinc-500">Low</span>
              <span className="text-[9px] font-medium text-zinc-500">High</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
