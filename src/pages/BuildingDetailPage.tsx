import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch';
import { Building2, Search, Filter, AlertTriangle, ArrowLeft, Loader2, Box, Edit } from 'lucide-react';
import { FloorRoomsCarousel } from '../components/FloorRoomsCarousel';
import { EditBuildingModal } from '../components/EditBuildingModal';

export const BuildingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [editingBuilding, setEditingBuilding] = useState<any>(null);

  // Building Info
  const { data: building, isLoading: buildingLoading, error: buildingError, refetch: refetchBuilding } = useFetch<any>(`/buildings/${id}`);
  
  // Open Issues Count
  const { data: openIssuesCount } = useFetch<number>(`/issues/building/${id}/open-count`);

  // Room Filters
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [floorFilter, setFloorFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const size = 1000; // Fetch all rooms to group by floor

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Construct query params
  const queryParams = new URLSearchParams({
    page: '0',
    size: size.toString(),
    buildingId: id || ''
  });
  if (debouncedSearch) queryParams.append('search', debouncedSearch);
  if (floorFilter) queryParams.append('floorNum', floorFilter);
  if (typeFilter) queryParams.append('type', typeFilter);

  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useFetch<any>(`/rooms/paged?${queryParams.toString()}`);

  const rooms = roomsData?.content || [];

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc: Record<number, any[]>, room: any) => {
    const floor = room.floorNum || 0;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const sortedFloors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);

  if (buildingLoading) {
    return <div className="p-8 flex justify-center text-zinc-500"><Loader2 className="animate-spin mr-2"/> Đang tải thông tin tòa nhà...</div>;
  }

  if (buildingError || !building) {
    return <div className="p-8 text-red-500 text-center">Không thể tải thông tin tòa nhà.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Back Button */}
      <Link to="/buildings" className="inline-flex items-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Quay lại danh sách
      </Link>

      {/* Building Header */}
      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Building2 className="text-sky-500" size={32} />
            {building.name}
            <button 
              onClick={() => setEditingBuilding(building)}
              className="ml-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-base font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105"
            >
              <Edit size={20} />
              Sửa
            </button>
          </h1>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white/50 dark:bg-zinc-950/50 rounded-xl px-5 py-3 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 font-medium mb-1 uppercase">Số tầng</div>
            <div className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{building.floorCount || 0}</div>
          </div>
          <div className="bg-white/50 dark:bg-zinc-950/50 rounded-xl px-5 py-3 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-500 font-medium mb-1 uppercase">Số phòng</div>
            <div className="text-xl font-bold text-zinc-800 dark:text-zinc-200">{building.roomCount || 0}</div>
          </div>
          
          <Link 
            to={`/issues?buildingId=${building.id}&status=OPEN`}
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

      {/* Rooms Section */}
      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
          <Box className="text-pink-500" size={20} />
          Danh sách Phòng
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm phòng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
          
          <div className="relative md:w-48">
            <select
              value={floorFilter}
              onChange={(e) => { setFloorFilter(e.target.value); }}
              className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="">Tất cả các tầng</option>
              {Array.from({ length: building.floorCount || 0 }, (_, i) => i + 1).map(f => (
                <option key={f} value={f}>Tầng {f}</option>
              ))}
            </select>
            <Filter className="absolute right-4 top-3.5 text-zinc-500 pointer-events-none" size={18} />
          </div>

          <div className="relative md:w-48">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); }}
              className="w-full appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="">Tất cả loại phòng</option>
              <option value="LAB">Phòng thực hành (LAB)</option>
              <option value="THEORY">Phòng lý thuyết</option>
              <option value="OFFICE">Phòng làm việc</option>
              <option value="MEETING">Phòng họp</option>
              <option value="RESTROOM">Nhà vệ sinh</option>
              <option value="OTHER">Khác</option>
            </select>
            <Filter className="absolute right-4 top-3.5 text-zinc-500 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Table */}
        {roomsLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Đang tải dữ liệu phòng...
          </div>
        ) : roomsError ? (
          <div className="text-red-400 py-10 text-center bg-red-400/10 rounded-xl">
            Lỗi khi tải dữ liệu phòng. Vui lòng thử lại.
          </div>
        ) : (
          <div>
            {sortedFloors.length > 0 ? (
              sortedFloors.map(floor => (
                <FloorRoomsCarousel key={floor} floor={floor} rooms={roomsByFloor[floor]} />
              ))
            ) : (
              <div className="py-20 text-center text-zinc-500 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50 mb-8">
                <Box className="mx-auto mb-3 text-zinc-700" size={48} />
                <p>Không tìm thấy phòng nào phù hợp với bộ lọc.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {editingBuilding && (
        <EditBuildingModal
          building={editingBuilding}
          onClose={() => setEditingBuilding(null)}
          onSuccess={() => {
            setEditingBuilding(null);
            refetchBuilding();
          }}
        />
      )}
    </div>
  );
};
