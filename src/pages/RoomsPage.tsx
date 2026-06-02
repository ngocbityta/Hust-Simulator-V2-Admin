import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Box, Search, Plus, Loader2 } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';

export const RoomsPage: React.FC = () => {
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

  const endpoint = `/rooms/paged?page=${page}&size=${size}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`;
  const { data, error, isLoading } = useFetch<any>(endpoint);
  
  const rooms = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Box className="text-pink-500" size={32} />
            Rooms
          </h1>
          <p className="text-zinc-400 mt-2">Manage building rooms and spaces</p>
        </div>
        <button className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-pink-500/20">
          <Plus size={20} />
          Add Room
        </button>
      </div>

      <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Search rooms..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Loading rooms...
          </div>
        ) : error ? (
          <div className="text-red-400 py-10 text-center bg-red-400/10 rounded-xl">
            Failed to load rooms. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-400 border-b border-zinc-800">
                  <th className="pb-4 font-medium px-4">Name</th>
                  <th className="pb-4 font-medium px-4">Building ID</th>
                  <th className="pb-4 font-medium px-4">Status</th>
                  <th className="pb-4 font-medium px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room: any) => (
                  <tr key={room.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="py-4 px-4 font-medium text-zinc-200">
                      {room.name || 'Unknown'}
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-mono text-sm">{room.buildingId}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        room.status === 'EMPTY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {room.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-sm text-zinc-400 hover:text-pink-400 px-3 py-1.5 rounded-lg hover:bg-pink-400/10 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500">
                      No rooms found matching your search.
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
