import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Calendar, Search, Plus, Loader2, Clock } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { EditEventModal } from '../components/simulation/EditEventModal';

const formatTime = (timeStr: string) => {
  if (!timeStr) return '--:-- --/--';
  const date = new Date(timeStr);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit'
  });
};

export const EventsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const endpoint = `/events/paged?page=${page}&size=${size}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`;
  const { data, error, isLoading } = useFetch<any>(endpoint);
  
  const events = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Calendar className="text-amber-500" size={32} />
            Quản lý Sự kiện
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Quản lý các sự kiện và hoạt động mô phỏng</p>
        </div>
        <button 
          onClick={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus size={20} />
          Tạo Sự kiện
        </button>
      </div>

      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Đang tải danh sách sự kiện...
          </div>
        ) : error ? (
          <div className="text-red-400 py-10 text-center bg-red-400/10 rounded-xl">
            Lỗi khi tải danh sách. Vui lòng thử lại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-4 font-medium px-4">Tên sự kiện</th>
                  <th className="pb-4 font-medium px-4">Bắt đầu</th>
                  <th className="pb-4 font-medium px-4">Kết thúc</th>
                  <th className="pb-4 font-medium px-4">Người tham gia</th>
                  <th className="pb-4 font-medium px-4">Trạng thái</th>
                  <th className="pb-4 font-medium px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event: any) => (
                  <tr key={event.id} className="border-b border-zinc-200/80 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Calendar size={18} className="text-amber-500" />
                        </div>
                        {event.name || 'Unnamed Event'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-zinc-400" />
                        {formatTime(event.startTime)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-zinc-400" />
                        {formatTime(event.endTime)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-medium">
                      {(() => {
                        const status = event.status?.toUpperCase();
                        if (status === 'SCHEDULED' || status === 'DRAFT') {
                          return <span className="text-zinc-400 italic font-normal">Chưa diễn ra</span>;
                        }
                        return event.actualParticipants ?? event.estimatedParticipants ?? 0;
                      })()}
                    </td>
                    <td className="py-4 px-4">
                      {(() => {
                        const status = event.status?.toUpperCase();
                        switch (status) {
                          case 'SCHEDULED':
                            return <span className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-500/20">Sắp diễn ra</span>;
                          case 'ONGOING':
                            return <span className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">Đang diễn ra</span>;
                          case 'COMPLETED':
                            return <span className="px-2.5 py-1 text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 rounded-full border border-zinc-500/20">Đã kết thúc</span>;
                          case 'CANCELLED':
                            return <span className="px-2.5 py-1 text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 rounded-full border border-red-500/20">Đã hủy</span>;
                          case 'DRAFT':
                            return <span className="px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full border border-amber-500/20">Bản nháp</span>;
                          default:
                            return <span className="px-2.5 py-1 text-xs font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 rounded-full border border-zinc-500/20">{status || 'UNKNOWN'}</span>;
                        }
                      })()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => {
                          setEditingEvent(event);
                          setIsModalOpen(true);
                        }}
                        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500">
                      Không tìm thấy sự kiện nào.
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

      {isModalOpen && (
        <EditEventModal
          event={editingEvent}
          onClose={() => {
            setEditingEvent(null);
            setIsModalOpen(false);
          }}
          onSuccess={() => {
            setEditingEvent(null);
            setIsModalOpen(false);
            const current = searchInput;
            setSearchInput(current + ' ');
            setTimeout(() => setSearchInput(current), 50);
          }}
        />
      )}
    </div>
  );
};
