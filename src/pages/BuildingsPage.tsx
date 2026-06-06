import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Building2, Search, Plus, Loader2 } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { Link } from 'react-router-dom';

export const BuildingsPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('roomCount,desc');
  const size = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Reset page to 0 when sort changes
  // handled in onChange event directly now


  const endpoint = `/buildings/paged?page=${page}&size=${size}&sort=${sortBy}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`;
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
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage simulated buildings and locations</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
          <Plus size={20} />
          Add Building
        </button>
      </div>

      <div className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 backdrop-blur-2xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Search buildings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
          <div className="w-full md:w-64">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              className="w-full px-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-900 dark:text-zinc-100 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%2371717a\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
            >
              <option value="roomCount,desc">Số phòng (Nhiều nhất)</option>
              <option value="floorCount,desc">Số tầng (Cao nhất)</option>
              <option value="population24h,desc">Số người đông nhất 24h qua</option>
              <option value="name,asc">Thứ tự bảng chữ cái</option>
            </select>
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
                <div key={building.id} className="bg-white dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-emerald-500/10 flex flex-col group">
                  <Link to={`/buildings/${building.id}`} className="block flex-1 flex flex-col group/link">
                    {/* Image Placeholder */}
                    <div className="h-48 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden border-b border-zinc-200/50 dark:border-zinc-800/50">
                      <img 
                        src={`https://picsum.photos/seed/${building.id}/400/200`} 
                        alt={building.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/link:opacity-90 group-hover/link:scale-105 transition-all duration-700 ease-out"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/40 to-transparent z-10" />
                      <Building2 className="text-zinc-400/50 dark:text-zinc-600/50 group-hover/link:scale-110 transition-transform duration-700 z-10" size={64} />
                      <span className="absolute bottom-3 left-4 z-20 text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded backdrop-blur-md">
                        {building.category || 'BUILDING'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col relative z-20">
                      <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 truncate group-hover/link:text-emerald-500 transition-colors duration-300" title={building.name}>
                        {building.name || 'Unknown Building'}
                      </h3>
                    </div>
                    </Link>
                </div>
              ))}
            </div>

            {buildings.length === 0 && (
              <div className="py-20 text-center text-zinc-500 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50 mb-8">
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
