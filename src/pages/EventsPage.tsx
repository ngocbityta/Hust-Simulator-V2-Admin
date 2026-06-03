import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { Calendar, Search, Plus, Loader2 } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';

export const EventsPage: React.FC = () => {
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
            Events
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage dynamic occurrences and temporary activities</p>
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20">
          <Plus size={20} />
          Create Event
        </button>
      </div>

      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Search events..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Loading events...
          </div>
        ) : error ? (
          <div className="text-red-400 py-10 text-center bg-red-400/10 rounded-xl">
            Failed to load events. Please try again.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
                  <th className="pb-4 font-medium px-4">Event Name</th>
                  <th className="pb-4 font-medium px-4">Map ID</th>
                  <th className="pb-4 font-medium px-4">Status</th>
                  <th className="pb-4 font-medium px-4 text-right">Actions</th>
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
                    <td className="py-4 px-4 text-zinc-500 text-sm font-mono truncate max-w-[150px]">{event.mapId}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                        {event.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-colors">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-zinc-500">
                      No events found.
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
