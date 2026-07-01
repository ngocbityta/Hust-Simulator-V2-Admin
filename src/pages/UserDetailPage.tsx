import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Navigation } from 'lucide-react';
import { INITIAL_VIEW_STATE } from '../constants/heatmap';
import type { ViewState } from '../types/heatmap';
import { useUserDetailData, type Tab } from '../hooks/useUserDetailData';
import { UserCheckinList } from '../components/user/UserCheckinList';
import { UserMap } from '../components/user/UserMap';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('passive');
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  const {
    passiveDataRaw,
    userData,
    buildings,
    buildingMap,
    passiveCheckins,
    activeCheckins,
    activePaths,
    buildingStats,
    isLoading,
    predictionResults,
    isPredicting,
    predictLocation,
    clearPrediction
  } = useUserDetailData(id, activeTab);

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
              Chi tiết Lộ trình của {userData?.fullName || userData?.username || 'User'}
            </h1>
            <p className="text-sm text-zinc-500 font-mono mt-0.5">ID: {id}</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab('passive'); setSelectedPoiId(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'passive' 
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Dữ liệu thu thập ngầm
          </button>
          <button
            onClick={() => { setActiveTab('active'); setSelectedPoiId(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'active' 
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Dữ liệu chủ động
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <UserCheckinList 
          activeTab={activeTab}
          selectedPoiId={selectedPoiId}
          setSelectedPoiId={setSelectedPoiId}
          isLoading={isLoading}
          passiveCheckins={passiveCheckins}
          activeCheckins={activeCheckins}
          buildingMap={buildingMap}
        />

        <UserMap 
          viewState={viewState}
          setViewState={setViewState}
          activeTab={activeTab}
          selectedPoiId={selectedPoiId}
          setSelectedPoiId={setSelectedPoiId}
          activePaths={activePaths}
          buildingStats={buildingStats}
          passiveDataRaw={passiveDataRaw}
          buildings={buildings}
          predictionResults={predictionResults}
          isPredicting={isPredicting}
          predictLocation={predictLocation}
          clearPrediction={clearPrediction}
        />
      </div>
    </div>
  );
};
