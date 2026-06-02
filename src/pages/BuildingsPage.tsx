import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Building2, Search, Plus, Loader2 } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';

export const BuildingsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const endpoint = `/buildings/paged?page=${page}&size=${size}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`;
  const { data, error, isLoading } = useFetch<any>(endpoint);
  
  const buildings = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Building2 className="text-emerald-500" size={32} />
            Buildings
          </h1>
          <p className="text-zinc-400 mt-2">Manage simulated buildings and locations</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
          Add Building
        </button>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Search buildings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Loading buildings...
          </div>
        ) : error ? (
          <div className="text-red-400 py-10 text-center bg-red-400/10 rounded-xl">
            Failed to load buildings. Please try again.
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {buildings.map((building: any) => (
                <div key={building.id} className="bg-zinc-950/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col group">
                  {/* Image Placeholder */}
                  <div className="h-48 bg-zinc-900 flex items-center justify-center relative overflow-hidden border-b border-zinc-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-10" />
                    <Building2 className="text-zinc-700/50 group-hover:scale-110 transition-transform duration-500" size={64} />
                    <span className="absolute bottom-3 left-4 z-20 text-xs font-medium text-zinc-500 uppercase tracking-wider bg-zinc-950/80 px-2 py-1 rounded">
                      Chưa có hình ảnh
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-zinc-100 mb-2 truncate">
                      {building.name || 'Unknown Building'}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 flex-1 line-clamp-2">
                      Thông tin chung của khu vực đang được cập nhật. Bạn có thể xem chi tiết hoặc quản lý các phòng bên trong.
                    </p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t border-zinc-800/50">
                      <button className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium py-2 rounded-lg transition-colors">
                        Quản lý Phòng
                      </button>
                      <button className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                        Sửa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {buildings.length === 0 && (
              <div className="py-20 text-center text-zinc-500 bg-zinc-950/30 rounded-xl border border-zinc-800/50 mb-8">
                <Building2 className="mx-auto mb-3 text-zinc-700" size={48} />
                <p>Không tìm thấy tòa nhà nào.</p>
              </div>
            )}
            
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
    </div>
  );
};
