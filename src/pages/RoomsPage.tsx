import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { apiFetch } from '../utils/api';
import { Box, Search, Plus, Loader2 } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { Link } from 'react-router-dom';
import { CreateRoomModal } from '../components/CreateRoomModal';

export const RoomsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [buildingFilter, setBuildingFilter] = useState('');
  const [buildings, setBuildings] = useState<any[]>([]);
  const size = 10;

  useEffect(() => {
    apiFetch('/buildings').then(setBuildings).catch(() => {});
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const endpoint = `/rooms/paged?page=${page}&size=${size}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}${buildingFilter ? `&buildingId=${buildingFilter}` : ''}`;
  const { data, error, isLoading, refetch } = useFetch<any>(endpoint);
  
  const rooms = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Box className="text-pink-500" size={32} />
            Quản lý Phòng
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Quản lý các phòng học và không gian trong tòa nhà</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-pink-500/20"
        >
          <Plus size={20} />
          Thêm Phòng
        </button>
      </div>

      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm phòng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-zinc-900 dark:text-zinc-100 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
            >
              <option value="">Tất cả tòa nhà</option>
              {buildings.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Đang tải danh sách phòng...
          </div>
        ) : error ? (
          <div className="text-red-400 py-10 text-center bg-red-400/10 rounded-xl">
            Lỗi khi tải danh sách phòng. Vui lòng thử lại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-4 font-medium px-4">Tên phòng</th>
                  <th className="pb-4 font-medium px-4">Tòa nhà</th>
                  <th className="pb-4 font-medium px-4">Trạng thái</th>
                  <th className="pb-4 font-medium px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room: any) => (
                  <tr key={room.id} className="border-b border-zinc-200/80 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {room.name || 'Không tên'}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 text-sm">
                      {buildings.find(b => b.id === room.buildingId)?.name || room.buildingId?.substring(0, 8) || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        room.status === 'EMPTY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {room.status === 'EMPTY' ? 'Trống' : room.status === 'OCCUPIED' ? 'Đang sử dụng' : room.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link 
                        to={`/rooms/${room.id}`}
                        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-pink-400 px-3 py-1.5 rounded-lg hover:bg-pink-400/10 transition-colors"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500">
                      Không tìm thấy phòng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            <Pagination 
              currentPage={page} 
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={size}
              onPageChange={setPage} 
            />
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};
