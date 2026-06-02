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
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="pb-4 font-medium px-4">Name</th>
                  <th className="pb-4 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building: any) => (
                  <tr key={building.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-4 font-medium text-zinc-200">
                      {building.name || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-sm text-zinc-400 hover:text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-400/10 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {buildings.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-10 text-center text-zinc-500">
                      No buildings found matching your search.
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
    </div>
  );
};
