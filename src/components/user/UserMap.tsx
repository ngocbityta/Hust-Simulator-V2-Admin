import React, { useMemo, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { PathLayer, PolygonLayer, TextLayer } from '@deck.gl/layers';
import { WebMercatorViewport } from '@deck.gl/core';
import ReactMap from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { ChevronDown, ChevronUp, Sparkles, TrendingUp, Eye, EyeOff, Clock, BarChart3, ArrowLeft } from 'lucide-react';
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
  clearPrediction?: () => void;
}

export const UserMap: React.FC<UserMapProps> = ({
  viewState,
  setViewState,
  activeTab,
  selectedPoiId,
  setSelectedPoiId,
  activePaths,
  buildingStats,
  passiveDataRaw: _passiveDataRaw,
  buildings,
  predictionResults,
  isPredicting,
  predictLocation,
  clearPrediction
}) => {
  const [targetTime, setTargetTime] = useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [showAllPredictions, setShowAllPredictions] = useState(false);
  const [showAllHistorical, setShowAllHistorical] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const PREDICTION_PREVIEW_COUNT = 3;
  const HISTORICAL_PREVIEW_COUNT = 5;

  const isPredictionMode = predictionResults?.candidateDestinations?.length > 0;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const addTime = (hours: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setTargetTime(d.toISOString().slice(0, 16));
  };

  const handlePredict = () => {
    if (targetTime && predictLocation) {
      setShowAllPredictions(false);
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
    <div className="flex-1 relative overflow-hidden">
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

      {/* Mode Indicator Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border backdrop-blur-xl ${
          isPredictionMode
            ? 'bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50'
            : 'bg-blue-50/90 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-700/50'
        }`}>
          {isPredictionMode ? (
            <>
              <Sparkles size={13} />
              Chế độ dự đoán
            </>
          ) : (
            <>
              <BarChart3 size={13} />
              Tổng hợp thời gian
            </>
          )}
        </div>
      </div>

      {/* Prediction Controls */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-[300px] max-w-[calc(100vw-2rem)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500" />
            <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider">Dự đoán địa điểm</label>
          </div>
          <button
            onClick={() => setShowMarkers(!showMarkers)}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-lg transition-colors border ${
              showMarkers
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/50'
            }`}
            title={showMarkers ? 'Ẩn nhãn % trên bản đồ' : 'Hiện nhãn % trên bản đồ'}
          >
            {showMarkers ? <Eye size={12} /> : <EyeOff size={12} />}
            {showMarkers ? 'Nhãn' : 'Ẩn'}
          </button>
        </div>
        
        <div className="flex gap-1.5">
          <button onClick={() => addTime(1)} className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700/50">+1 Giờ</button>
          <button onClick={() => addTime(3)} className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700/50">+3 Giờ</button>
          <button onClick={() => addTime(24)} className="flex-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700/50">+1 Ngày</button>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="datetime-local"
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            value={targetTime}
            onChange={(e) => setTargetTime(e.target.value)}
          />
          <button
            onClick={handlePredict}
            disabled={!targetTime || isPredicting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:from-blue-600 disabled:to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isPredicting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang dự đoán...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Dự đoán
              </>
            )}
          </button>
        </div>
      </div>

      {/* HTML Markers layer overlaying everything */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {showMarkers && displayData.map((stat: any) => {
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

        {/* Prediction Markers - only show numbered badges when % markers are hidden */}
        {!showMarkers && predictionResults?.candidateDestinations?.map((dest: any, index: number) => {
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
      {isPredictionMode ? (
        <div className="absolute bottom-4 left-4 z-50 w-[340px] max-w-[calc(100vw-2rem)]">
          <div className="bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-800/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-100 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Dự đoán địa điểm đến</h3>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                {predictionResults.candidateDestinations.length} kết quả
              </span>
            </div>

            {/* List */}
            <div className={`overflow-y-auto transition-all ${showAllPredictions ? 'max-h-[280px]' : 'max-h-[200px]'} custom-scrollbar`}
                 style={{ scrollbarWidth: 'thin' }}>
              {(showAllPredictions
                ? predictionResults.candidateDestinations
                : predictionResults.candidateDestinations.slice(0, PREDICTION_PREVIEW_COUNT)
              ).map((dest: any, index: number) => (
                <div
                  key={dest.poiId}
                  onClick={() => setSelectedPoiId(dest.poiId === selectedPoiId ? null : dest.poiId)}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0 ${
                    selectedPoiId === dest.poiId
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {/* Rank badge */}
                  <span className={`flex-none w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${
                    index === 0
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      : index === 1
                      ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                      : index === 2
                      ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500'
                  }`}>
                    {index + 1}
                  </span>

                  {/* Name + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate" title={dest.poiName}>
                        {dest.poiName}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 flex-none">
                        {(dest.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-700/50 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                          index === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                        style={{ width: `${Math.min(dest.probability * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* See More / See Less Button */}
            {predictionResults.candidateDestinations.length > PREDICTION_PREVIEW_COUNT && (
              <button
                onClick={() => setShowAllPredictions(!showAllPredictions)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border-t border-zinc-100 dark:border-zinc-800"
              >
                {showAllPredictions ? (
                  <>
                    <ChevronUp size={14} />
                    Thu gọn
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    Xem thêm ({predictionResults.candidateDestinations.length - PREDICTION_PREVIEW_COUNT} kết quả)
                  </>
                )}
              </button>
            )}

            {/* Footer with back button */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-50/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Sparkles size={10} className="text-indigo-400" />
                Sắp xếp theo mức độ phù hợp
              </span>
              {clearPrediction && (
                <button
                  onClick={() => { clearPrediction(); setSelectedPoiId(null); }}
                  className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                >
                  <ArrowLeft size={11} />
                  Quay lại tổng hợp
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Historical Stats Panel */
        buildingStats.data.length > 0 && (
          <div className="absolute bottom-4 left-4 z-50 w-[340px] max-w-[calc(100vw-2rem)]">
            <div className="bg-white dark:bg-zinc-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-zinc-800/50 dark:to-zinc-800/30">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-blue-500" />
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Tổng hợp thời gian</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                  {buildingStats.data.length} địa điểm
                </span>
              </div>

              {/* Total duration summary */}
              <div className="px-4 py-2.5 bg-blue-50/50 dark:bg-blue-900/10 border-b border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Clock size={12} className="text-blue-400" />
                  <span>Tổng thời gian ghi nhận:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {formatDuration(buildingStats.totalDuration)}
                  </span>
                </div>
              </div>

              {/* List */}
              <div className={`overflow-y-auto transition-all ${showAllHistorical ? 'max-h-[280px]' : 'max-h-[200px]'} custom-scrollbar`}
                   style={{ scrollbarWidth: 'thin' }}>
                {(showAllHistorical
                  ? buildingStats.data
                  : buildingStats.data.slice(0, HISTORICAL_PREVIEW_COUNT)
                ).map((stat: any, index: number) => (
                  <div
                    key={stat.poi_id}
                    onClick={() => setSelectedPoiId(stat.poi_id === selectedPoiId ? null : stat.poi_id)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-zinc-50 dark:border-zinc-800/50 last:border-b-0 ${
                      selectedPoiId === stat.poi_id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {/* Rank number */}
                    <span className="flex-none w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500">
                      {index + 1}
                    </span>

                    {/* Name + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate" title={stat.name}>
                          {stat.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 flex-none">
                          {(stat.percentage || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex-1 bg-zinc-100 dark:bg-zinc-700/50 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${Math.min(stat.percentage || 0, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 block">
                        {formatDuration(stat.duration || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* See More / See Less Button */}
              {buildingStats.data.length > HISTORICAL_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllHistorical(!showAllHistorical)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-zinc-100 dark:border-zinc-800"
                >
                  {showAllHistorical ? (
                    <>
                      <ChevronUp size={14} />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} />
                      Xem thêm ({buildingStats.data.length - HISTORICAL_PREVIEW_COUNT} địa điểm)
                    </>
                  )}
                </button>
              )}

              {/* Footer hint */}
              <div className="px-4 py-2 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 bg-zinc-50/50 dark:bg-zinc-800/30">
                <BarChart3 size={10} className="text-blue-400" />
                Tỷ lệ thời gian ở mỗi địa điểm từ trước đến nay
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};
