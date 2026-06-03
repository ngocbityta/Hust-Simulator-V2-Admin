import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { Box, AlertTriangle, ArrowLeft, Loader2, Info } from 'lucide-react';

export const RoomDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Room Info
  const { data: room, isLoading: roomLoading, error: roomError } = useFetch<any>(`/rooms/${id}`);
  
  // Open Issues Count
  const { data: openIssuesCount } = useFetch<number>(`/issues/room/${id}/open-count`);

  if (roomLoading) {
    return <div className="p-8 flex justify-center text-zinc-500"><Loader2 className="animate-spin mr-2"/> Loading room details...</div>;
  }

  if (roomError || !room) {
    return <div className="p-8 text-red-500 text-center">Failed to load room.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Quay lại
      </button>

      {/* Room Header */}
      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Box className="text-pink-500" size={32} />
            {room.name || 'Không tên'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-mono text-sm">ID: {room.id}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link 
            to={`/issues?roomId=${room.id}&status=OPEN`}
            className="bg-amber-500/10 hover:bg-amber-500/20 rounded-xl px-5 py-3 border border-amber-500/20 transition-colors group flex flex-col items-center justify-center min-w-[120px]"
          >
            <div className="flex items-center text-amber-500 gap-1.5 mb-1">
              <AlertTriangle size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Sự cố</span>
            </div>
            <div className="text-xl font-bold text-amber-400">
              {openIssuesCount !== undefined ? openIssuesCount : <Loader2 size={16} className="animate-spin inline" />}
            </div>
          </Link>
        </div>
      </div>

      {/* Room Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center text-zinc-500 dark:text-zinc-400 mb-4 gap-2">
            <Info size={18} />
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Thông tin cơ bản</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Tòa nhà</div>
              <Link to={`/buildings/${room.buildingId}`} className="text-sky-400 hover:underline font-mono text-sm">
                {room.buildingId}
              </Link>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Tầng</div>
              <div className="text-lg font-medium text-zinc-800 dark:text-zinc-200">{room.floorNum || 'Không xác định'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Loại phòng</div>
              <div className="text-lg font-medium text-zinc-800 dark:text-zinc-200">{room.type || 'Không xác định'}</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center text-zinc-500 dark:text-zinc-400 mb-4 gap-2">
            <Box size={18} />
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">Sức chứa & Trạng thái</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Sức chứa (Người)</div>
              <div className="text-xl font-bold text-pink-400">{room.capacity || 'Không xác định'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Trạng thái</div>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border ${
                room.status === 'EMPTY' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {room.status || 'UNKNOWN'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
