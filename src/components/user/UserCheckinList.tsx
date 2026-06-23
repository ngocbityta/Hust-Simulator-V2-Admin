import React, { useMemo } from 'react';
import { MapPin, Loader2, Calendar, Clock } from 'lucide-react';
import type { Tab } from '../../hooks/useUserDetailData';

interface UserCheckinListProps {
  activeTab: Tab;
  selectedPoiId: string | null;
  setSelectedPoiId: (id: string | null) => void;
  isLoading: boolean;
  passiveCheckins: any[];
  activeCheckins: any[];
  buildingMap: Map<string, any>;
}

export const UserCheckinList: React.FC<UserCheckinListProps> = ({
  activeTab,
  selectedPoiId,
  setSelectedPoiId,
  isLoading,
  passiveCheckins,
  activeCheckins,
  buildingMap
}) => {
  const currentList = useMemo(() => {
    const list = activeTab === 'passive' ? passiveCheckins : activeCheckins;
    if (selectedPoiId) {
      return list.filter(c => c.poi_id === selectedPoiId || c.referenceId === selectedPoiId);
    }
    return list;
  }, [activeTab, passiveCheckins, activeCheckins, selectedPoiId]);

  return (
    <div className="w-1/3 min-w-[320px] max-w-md bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <MapPin size={18} className="text-blue-500" />
          Lịch sử Check-in
        </h2>
        {activeTab === 'active' && (
          <p className="text-sm text-zinc-500 mt-1">
            Dữ liệu lộ trình do người dùng chủ động lưu lại.
          </p>
        )}
        {selectedPoiId && (
          <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
            <span className="text-sm text-blue-700 dark:text-blue-300 font-medium flex items-center gap-1.5">
              <MapPin size={14} />
              {buildingMap.get(selectedPoiId)?.name}
            </span>
            <button 
              onClick={() => setSelectedPoiId(null)}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline font-medium transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
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
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Calendar size={14} />
                  {new Date(checkin.timestamp).toLocaleString('vi-VN')}
                </div>
                {checkin.duration_seconds !== undefined && (
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Clock size={14} />
                    {Math.floor(checkin.duration_seconds / 60)} phút
                  </div>
                )}
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
  );
};
