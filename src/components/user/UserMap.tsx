import React, { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { PathLayer, PolygonLayer, TextLayer } from '@deck.gl/layers';
import { WebMercatorViewport } from '@deck.gl/core';
import ReactMap from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { MAP_STYLE } from '../../constants/heatmap';
import type { ViewState } from '../../types/heatmap';
import type { Tab } from '../../hooks/useUserDetailData';

interface UserMapProps {
  viewState: ViewState;
  setViewState: (viewState: ViewState) => void;
  activeTab: Tab;
  selectedPoiId: string | null;
  setSelectedPoiId: (id: string | null) => void;
  activePaths: any[];
  buildingStats: { data: any[]; totalDuration: number };
  passiveDataRaw?: any;
  buildings?: any[];
  predictionResults?: any;
  isPredicting?: boolean;
  predictLocation?: (targetTimestampMs: number) => void;
}

export const UserMap: React.FC<UserMapProps> = ({
  viewState,
  setViewState,
  activeTab,
  selectedPoiId,
  setSelectedPoiId,
  activePaths,
  buildingStats,
  passiveDataRaw,
  buildings,
  predictionResults,
  isPredicting,
  predictLocation
}) => {
  const [targetTime, setTargetTime] = useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const addTime = (hours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setTargetTime(d.toISOString().slice(0, 16));
  };

  const handlePredict = () => {
    if (targetTime && predictLocation) {
      const timestampMs = new Date(targetTime).getTime();
      predictLocation(timestampMs);
    }
  };

  const displayData = useMemo(() => {
    if (predictionResults?.candidateDestinations?.length > 0) {
      return predictionResults.candidateDestinations.map((dest: any) => ({
        ...dest,
        poi_id: dest.poiId,
        percentage: dest.probability * 100,
        isPrediction: true
      }));
    }
    return buildingStats.data.map((stat: any) => ({ ...stat, isPrediction: false }));
  }, [predictionResults, buildingStats.data]);

  // Layers for DeckGL
  const layers = useMemo(() => {
    const result = [];
    // Draw active journey paths
    if (activeTab === 'active' && activePaths.length > 0) {
      result.push(
        new PathLayer({
          id: 'active-journey-path',
          data: activePaths,
          getPath: (d: any) => d.path,
          getColor: (d: any) => d.color as any,
          getWidth: 4,
          widthMinPixels: 2,
        })
      );
    }
    // Draw visited buildings or predicted buildings as highlighted polygons
    if (displayData.length > 0) {
      const passivePolygons = displayData.map((stat: any) => {
        const b = buildings?.find(b => b.id === stat.poi_id);
        let polygon = [];
        try {
           polygon = b?.coordinates ? JSON.parse(b.coordinates) : [];
        } catch(e){}
        
        let fillColorArray: [number, number, number, number] = [255, 255, 255, 100];
        if (b?.fillColor) {
          const colorParts = b.fillColor.split(',').map(Number);
          fillColorArray = [
            colorParts[0] ?? 255, 
            colorParts[1] ?? 255,
            colorParts[2] ?? 255, 
            colorParts[3] ?? 200
          ];
        }

        return {
           polygon,
           fillColor: stat.poi_id === selectedPoiId ? [56, 189, 248, 200] : fillColorArray,
           lineColor: stat.poi_id === selectedPoiId ? [56, 189, 248, 255] : [255, 255, 255, 200],
           ...stat
        };
      }).filter((d: any) => d.polygon && d.polygon.length > 0);

      if (passivePolygons.length > 0) {
        result.push(
          new PolygonLayer({
            id: 'visited-buildings',
            data: passivePolygons,
            getPolygon: (d: any) => d.polygon,
            getFillColor: (d: any) => d.fillColor,
            getLineColor: (d: any) => d.lineColor,
            getLineWidth: (d: any) => d.poi_id === selectedPoiId ? 3.0 : 1.2,
            lineWidthMinPixels: 1,
            filled: true,
            stroked: true,
            pickable: true,
            autoHighlight: true,
            highlightColor: [255, 255, 255, 100],
            onClick: (info) => {
              if (info.object) {
                setSelectedPoiId(info.object.poi_id === selectedPoiId ? null : info.object.poi_id);
              }
            }
          }),
          new TextLayer({
            id: 'visited-building-labels',
            data: passivePolygons,
            getPosition: (d: any) => [d.lng, d.lat],
            getText: (d: any) => d.name,
            getSize: 12,
            getColor: [0, 0, 0, 255],
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            characterSet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ👥🔒 ()-',
            fontSettings: { sdf: true },
            pickable: false
          })
        );
      }
    }

    return result;
  }, [activeTab, activePaths, displayData, buildings, selectedPoiId, setSelectedPoiId]);

  // Project coordinates to pixels for HTML Markers to overlay on top of Deck.gl
  const viewport = new WebMercatorViewport(viewState as any);

  return (
    <div className="flex-1 relative">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState as unknown as ViewState)}
        controller={true}
        layers={layers}
      >
        <ReactMap
          mapLib={maplibregl}
          mapStyle={MAP_STYLE}
          attributionControl={false}
          {...viewState}
        />
      </DeckGL>

      {/* Prediction Controls */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-80">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Thời gian dự đoán</label>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => addTime(1)} className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700/50">+1 Giờ</button>
          <button onClick={() => addTime(3)} className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700/50">+3 Giờ</button>
          <button onClick={() => addTime(24)} className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700/50">+1 Ngày</button>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="datetime-local"
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
          />
          <button
            onClick={handlePredict}
            disabled={!targetTime || isPredicting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:from-blue-600 disabled:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
          >
            {isPredicting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang dự đoán...
              </div>
            ) : 'Dự đoán'}
          </button>
        </div>
      </div>

      {/* HTML Markers layer overlaying everything */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {displayData.map((stat: any) => {
          const [x, y] = viewport.project([stat.lng, stat.lat]);
          return (
            <div 
              key={stat.poi_id}
              className="absolute pointer-events-auto"
              style={{ left: x, top: y, transform: 'translate(-50%, -100%)', marginTop: '-15px' }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPoiId(stat.poi_id === selectedPoiId ? null : stat.poi_id);
              }}
            >
              <div className={`
                relative group cursor-pointer transition-all duration-500 ease-out transform -translate-y-2
                ${selectedPoiId === stat.poi_id ? 'scale-110 z-50' : 'hover:scale-105 z-10'}
              `}>
                {/* Glow Effect */}
                <div className={`absolute inset-0 blur-md rounded-xl transition-opacity duration-500 ${selectedPoiId === stat.poi_id ? 'bg-blue-500/50 opacity-100' : 'bg-blue-500/20 opacity-0 group-hover:opacity-100'}`} />
                
                {/* Main Card */}
                <div className={`
                  relative px-2 py-1.5 rounded-lg shadow-2xl backdrop-blur-xl border
                  ${selectedPoiId === stat.poi_id 
                    ? 'bg-blue-900/80 border-blue-400 text-white' 
                    : 'bg-zinc-900/70 border-white/10 text-zinc-200 hover:bg-zinc-800/80 hover:border-white/20'}
                `}>
                  <div className="flex items-center gap-1.5 w-full min-w-[60px]">
                    <div className="flex-1 bg-black/40 rounded-full h-1.5 overflow-hidden shadow-inner border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${selectedPoiId === stat.poi_id ? 'from-blue-300 to-white' : (stat.isPrediction ? 'from-indigo-500 to-purple-400' : 'from-blue-600 to-cyan-400')}`} 
                        style={{ width: `${Math.min((stat.percentage || 0), 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-medium opacity-90 drop-shadow-md text-cyan-50">
                      {((stat.percentage || 0)).toFixed(1)}%
                    </span>
                  </div>
                </div>
                {/* Pointer Arrow */}
                <div className={`
                  absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b backdrop-blur-xl
                  ${selectedPoiId === stat.poi_id 
                    ? 'bg-blue-900/80 border-blue-400' 
                    : 'bg-zinc-900/70 border-white/10 group-hover:bg-zinc-800/80 group-hover:border-white/20'}
                `}></div>
              </div>
            </div>
          );
        })}

        {/* Prediction Markers */}
        {predictionResults?.candidateDestinations?.map((dest: any, index: number) => {
          const [x, y] = viewport.project([dest.lng, dest.lat]);
          return (
            <div
              key={`pred-${dest.poiId}`}
              className="absolute pointer-events-auto"
              style={{ left: x, top: y, transform: 'translate(-50%, -100%)', marginTop: '-15px' }}
            >
               <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-dashed border-zinc-400 dark:border-zinc-500 bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-lg text-zinc-900 dark:text-white font-bold">
                 {index + 1}
                 <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 border-dashed border-zinc-400 dark:border-zinc-500 bg-transparent"></div>
               </div>
            </div>
          );
        })}
      </div>

      {/* Prediction Results Panel */}
      {predictionResults && predictionResults.candidateDestinations && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl">
          <div className="bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Top địa điểm có thể đến (dự đoán)</h3>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {predictionResults.candidateDestinations.slice(0, 3).map((dest: any, index: number) => (
                <div key={dest.poiId} className="flex-1 min-w-[200px] flex flex-col gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate flex-1" title={dest.poiName}>
                      {dest.poiName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(dest.probability * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400">
                      {(dest.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gợi ý được sắp xếp theo mức độ phù hợp (cao → thấp).
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
