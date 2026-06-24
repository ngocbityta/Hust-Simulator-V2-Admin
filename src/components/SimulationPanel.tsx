import React, { useState, useMemo } from 'react';
import type { SimulationScenario, VirtualEvent, ClosedFacility } from '../types/simulation';
import type { HeatmapResponse } from '../types/heatmap';
import EventsSection from './simulation/EventsSection';
import FacilitiesSection from './simulation/FacilitiesSection';
import PopulationSection from './simulation/PopulationSection';
import { Settings2, Clock, ChevronRight, Eye, RefreshCw, Play, Loader2, ListTree, AlertCircle, X } from 'lucide-react';

interface SimulationPanelProps {
  scenario: SimulationScenario;
  result: HeatmapResponse | null;
  loading: boolean;
  error: string | null;
  hasChanges: boolean;
  onAddEvent: (event: VirtualEvent) => void;
  onRemoveEvent: (id: string) => void;
  onUpdateEvent: (id: string, updates: Partial<VirtualEvent>) => void;
  onToggleFacility: (facility: ClosedFacility) => void;
  onSetMultiplier: (value: number) => void;
  onSetTargetTime: (value: string) => void;
  onRemoveCustomBuilding: (id: string) => void;
  onRunSimulation: () => void;
  onResetAll: () => void;
  onExitSimulation: () => void;
  panelCollapsed: boolean;
  setPanelCollapsed: (collapsed: boolean) => void;
}

export default React.memo(function SimulationPanel({
  scenario,
  result,
  loading,
  error,
  hasChanges,
  onAddEvent,
  onRemoveEvent,
  onUpdateEvent,
  onToggleFacility,
  onSetMultiplier,
  onSetTargetTime,
  onRemoveCustomBuilding,
  onRunSimulation,
  onResetAll,
  onExitSimulation,
  panelCollapsed,
  setPanelCollapsed,
}: SimulationPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    events: true,
    facilities: false,
    population: false,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const changeCount = useMemo(() => {
    let c = 0;
    c += scenario.virtualEvents.length;
    c += scenario.closedFacilities.length;
    if (scenario.userCountMultiplier !== 1.0) c++;
    return c;
  }, [scenario]);

  return (
    <div
      className="absolute top-5 left-5 z-10 flex flex-col select-none transition-all duration-300 shadow-2xl"
      style={{ width: panelCollapsed ? 56 : 384 }}
    >
      {/* Header */}
      <button
        onClick={() => setPanelCollapsed(!panelCollapsed)}
        className={`bg-zinc-950/80 backdrop-blur-2xl border border-amber-500/20 px-5 py-3.5 cursor-pointer flex items-center justify-between gap-3 transition-all duration-300 shadow-2xl hover:bg-zinc-900/90 ${panelCollapsed ? 'rounded-2xl' : 'rounded-t-2xl'}`}
      >
        {!panelCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Settings2 size={16} className="text-amber-500" />
            </div>
            <span className="font-bold text-[16px] tracking-wide text-zinc-100">
              Simulation
            </span>
            {changeCount > 0 && (
              <span className="ml-1 text-[11px] bg-amber-500 text-black px-2 py-0.5 rounded-full font-bold shadow-sm shadow-amber-500/30">
                {changeCount}
              </span>
            )}
          </div>
        ) : (
          <Settings2 size={20} className="text-amber-500 mx-auto" />
        )}
        <ChevronRight size={18} className={`text-zinc-500 transition-transform duration-300 ${panelCollapsed ? 'rotate-0 hidden' : 'rotate-90'}`} />
      </button>

      {!panelCollapsed && (
        <div className="bg-zinc-950/80 backdrop-blur-2xl border border-amber-500/15 border-t-0 rounded-b-2xl max-h-[calc(100vh-120px)] overflow-y-auto flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.6)] custom-scrollbar">
          
          {/* Header Action */}
          <div className="px-4 pt-3 pb-2 flex justify-between items-center border-b border-white/5">
            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.1em] flex items-center gap-1.5">
              Cấu hình giả lập
            </span>
            <button
              onClick={onExitSimulation}
              className="text-[10px] font-bold text-violet-400 bg-violet-400/10 border border-violet-400/20 rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-violet-400/20 hover:text-violet-300 transition-all duration-200 flex items-center gap-1.5 shadow-sm shadow-violet-500/10"
            >
              <Eye size={12} /> Về Quan sát
            </button>
          </div>

          {/* Target Time */}
          <div className="px-4 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Clock size={12} className="text-zinc-400" />
              <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">Thời điểm giả lập</span>
            </div>
            {/* Custom styled time input wrapper */}
            <div className="relative group mb-1">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl blur-md transition-opacity duration-300 opacity-100 group-hover:opacity-70"></div>
              <div className="relative flex items-center bg-zinc-950/80 border border-white/10 rounded-xl p-1 overflow-hidden transition-all duration-300 group-hover:border-amber-500/50 shadow-inner">
                <div className="flex-1 px-3 py-2">
                  <input
                    type="datetime-local"
                    value={scenario.targetTime}
                    onChange={(e) => onSetTargetTime(e.target.value)}
                    className="w-full bg-transparent text-zinc-100 text-[14px] font-bold outline-none cursor-pointer appearance-none tracking-wide"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 rounded-lg mr-1 group-hover:bg-amber-500/20 transition-colors cursor-pointer">
                  <Clock size={16} className="text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Sections */}
          <EventsSection
            events={scenario.virtualEvents}
            onAdd={onAddEvent}
            onRemove={onRemoveEvent}
            onUpdate={onUpdateEvent}
            expanded={expandedSections.events}
            onToggle={() => toggleSection('events')}
          />

          <FacilitiesSection
            closedFacilities={scenario.closedFacilities}
            onToggle={onToggleFacility}
            expanded={expandedSections.facilities}
            onToggleSection={() => toggleSection('facilities')}
          />

          <PopulationSection
            multiplier={scenario.userCountMultiplier}
            onChange={onSetMultiplier}
            expanded={expandedSections.population}
            onToggle={() => toggleSection('population')}
            baseTotal={result?.totalOnline}
          />



          {/* Error */}
          {error && (
            <div className="mx-4 mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5 text-[12px] text-red-300 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Simulation Reasons */}
          {result?.simulationReasons && result.simulationReasons.length > 0 && (
            <div className="mx-4 mt-3 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3.5 py-3 shadow-inner">
              <div className="text-[11px] font-bold text-amber-500 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <ListTree size={12} /> Kịch bản đã áp dụng:
              </div>
              <div className="space-y-1.5">
                {result.simulationReasons.map((r, i) => (
                  <div key={i} className="text-[12px] text-zinc-300 leading-snug flex items-start gap-2">
                    <span className="text-amber-500 text-[10px] mt-1 shrink-0">●</span> 
                    <span className="opacity-90">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-4 flex flex-col gap-2.5">
            <button
              onClick={onRunSimulation}
              disabled={loading}
              className={`relative overflow-hidden w-full text-[13px] font-bold py-3.5 rounded-xl border-none flex items-center justify-center gap-2 tracking-wide transition-all duration-300 ${
                loading
                  ? 'bg-amber-500/20 text-amber-600/80 cursor-wait'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black cursor-pointer shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.5)] hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang tính toán...
                </>
              ) : (
                <>
                  <Play size={16} className="fill-black" />
                  CHẠY GIẢ LẬP
                </>
              )}
            </button>

            {hasChanges && (
              <button
                onClick={onResetAll}
                className="w-full text-[12px] font-semibold py-2.5 rounded-xl border border-white/10 bg-white/5 text-zinc-400 cursor-pointer hover:bg-white/10 hover:text-zinc-200 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={12} /> Đặt lại tất cả
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
});
