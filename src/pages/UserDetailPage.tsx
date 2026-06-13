import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { ArrowLeft, Loader2, MapPin, Navigation, Calendar } from 'lucide-react';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, PathLayer } from '@deck.gl/layers';
import ReactMap from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INITIAL_VIEW_STATE, MAP_STYLE } from '../constants/heatmap';
import type { ViewState } from '../types/heatmap';

type Tab = 'passive' | 'active';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('passive');
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  // Fetch Passive Data (STTF)
  const { data: passiveData, isLoading: isLoadingPassive } = useFetch<any[]>(
    `/prediction-data/checkin-sequences/${id}`
  );

  // Fetch Active Data (Journeys)
  const { data: activeJourneys, isLoading: isLoadingActive } = useFetch<any[]>(
    `/journeys/user/${id}`
  );

  // Fetch Buildings for mapping POI ID to Name and Location
  const { data: buildingsData } = useFetch<any>('/buildings/active');
  const buildings = buildingsData?.content || [];

  const buildingMap = useMemo(() => {
    const map = new Map();
    buildings.forEach((b: any) => {
      map.set(b.id, b);
    });
    return map;
  }, [buildings]);

  // Transform passive data for map and list
  const passiveCheckins = useMemo(() => {
    if (!passiveData) return [];
    return passiveData.map(c => {
      const b = buildingMap.get(c.poi_id);
      return {
        ...c,
        poi_name: b?.name || 'Unknown Location',
        lat: b?.lat || 0,
        lng: b?.lng || 0,
      };
    });
  }, [passiveData, buildingMap]);

  // Extract active checkins for map and list
  const activeCheckins = useMemo(() => {
    if (!activeJourneys) return [];
    const checkins: any[] = [];
    activeJourneys.forEach(j => {
      if (j.items) {
        j.items.forEach((item: any) => {
          if (item.referenceId) {
            const b = buildingMap.get(item.referenceId);
            checkins.push({
              ...item,
              journey_id: j.id,
              poi_name: b?.name || 'Unknown Location',
              lat: b?.lat || item.latitude || 0,
              lng: b?.lng || item.longitude || 0,
              timestamp: item.timestamp,
            });
          }
        });
      }
    });
    // Sort by timestamp desc
    return checkins.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activeJourneys, buildingMap]);

  // Extract paths for active journeys
  const activePaths = useMemo(() => {
    if (!activeJourneys) return [];
    return activeJourneys
      .filter(j => j.pathCoordinates && j.pathCoordinates.length > 1)
      .map(j => ({
        path: j.pathCoordinates.map((coord: any) => [coord.longitude, coord.latitude]),
        color: [50, 150, 250]
      }));
  }, [activeJourneys]);

  // Layers for DeckGL
  const layers = useMemo(() => {
    const currentCheckins = activeTab === 'passive' ? passiveCheckins : activeCheckins;
    
    // Sort ascending for path drawing
    const chronologicalCheckins = [...currentCheckins].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const result = [];

    // Draw lines connecting check-ins for passive tab to show sequence
    if (activeTab === 'passive' && chronologicalCheckins.length > 1) {
      const pathData = [{
        path: chronologicalCheckins.filter(c => c.lng && c.lat).map(c => [c.lng, c.lat]),
        color: [255, 100, 100, 200]
      }];
      
      result.push(
        new PathLayer({
          id: 'passive-sequence-path',
          data: pathData,
          getPath: d => d.path,
          getColor: d => d.color as any,
          getWidth: 3,
          widthMinPixels: 2,
        })
      );
    }

    // Draw active journey paths
    if (activeTab === 'active' && activePaths.length > 0) {
      result.push(
        new PathLayer({
          id: 'active-journey-path',
          data: activePaths,
          getPath: d => d.path,
          getColor: d => d.color as any,
          getWidth: 4,
          widthMinPixels: 2,
        })
      );
    }

    // Draw check-in markers
    result.push(
      new ScatterplotLayer({
        id: 'checkin-markers',
        data: currentCheckins.filter(c => c.lng && c.lat),
        getPosition: d => [d.lng, d.lat],
        getFillColor: activeTab === 'passive' ? [255, 50, 50, 200] : [50, 100, 255, 200],
        getRadius: 10,
        radiusMinPixels: 6,
        radiusMaxPixels: 15,
        pickable: true,
      })
    );

    return result;
  }, [activeTab, passiveCheckins, activeCheckins, activePaths]);

  const isLoading = activeTab === 'passive' ? isLoadingPassive : isLoadingActive;
  const currentList = activeTab === 'passive' ? passiveCheckins : activeCheckins;

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="flex-none bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="text-zinc-600 dark:text-zinc-400" size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Navigation className="text-blue-500" size={20} />
              Chi tiết Lộ trình User
            </h1>
            <p className="text-sm text-zinc-500 font-mono mt-0.5">{id}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('passive')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'passive' 
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Dữ liệu train STTF (Ngầm)
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'active' 
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Journeys (Chủ động)
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel - List */}
        <div className="w-1/3 min-w-[320px] max-w-md bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <MapPin size={18} className="text-blue-500" />
              Lịch sử Check-in
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              {activeTab === 'passive' 
                ? 'Dữ liệu được thu thập ngầm và gán nhãn POI tự động.'
                : 'Dữ liệu lộ trình do người dùng chủ động lưu lại.'}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center py-10 text-zinc-500">
                <Loader2 className="animate-spin mr-2" size={20} />
                Đang tải dữ liệu...
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                Không có dữ liệu check-in nào.
              </div>
            ) : (
              currentList.map((checkin, idx) => (
                <div key={checkin.id || idx} className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-base mb-1">
                    {checkin.poi_name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Calendar size={14} />
                    {new Date(checkin.timestamp).toLocaleString('vi-VN')}
                  </div>
                  {activeTab === 'active' && checkin.journey_id && (
                    <div className="mt-2 text-xs font-mono text-zinc-400 dark:text-zinc-500 bg-zinc-200 dark:bg-zinc-900 inline-block px-2 py-1 rounded">
                      Journey: {checkin.journey_id.substring(0, 8)}...
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Map */}
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
            />
          </DeckGL>
        </div>
        
      </div>
    </div>
  );
};
