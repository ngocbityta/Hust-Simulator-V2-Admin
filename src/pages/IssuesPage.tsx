import React, { useState } from 'react';
import { useFetch } from '../hooks/useFetch';
import { AlertTriangle, CheckCircle2, Clock, Filter, AlertCircle, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { apiFetch } from '../utils/api';
import { useSearchParams } from 'react-router-dom';
import { Pagination } from '../components/common/Pagination';

interface FacilityIssue {
  id: string;
  buildingId: string;
  roomId?: string;
  reporterId: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export const IssuesPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialBuildingId = searchParams.get('buildingId') || '';
  const initialRoomId = searchParams.get('roomId') || '';
  
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const buildingFilter = initialBuildingId;
  const roomFilter = initialRoomId;

  // Debounce search input
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, loading, error, refetch } = useFetch<any>(
    `/issues/paged?page=${page}&size=10&sort=createdAt,desc${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${buildingFilter ? `&buildingId=${buildingFilter}` : ''}${roomFilter ? `&roomId=${roomFilter}` : ''}`
  );

  const resolveIssue = async (id: string) => {
    try {
      const adminId = user?.id || '';
      await apiFetch(`/issues/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'RESOLVED', resolvedBy: adminId })
      });
      showToast('Đã đánh dấu sự cố là đã giải quyết', 'success');
      refetch();
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi giải quyết sự cố', 'error');
    }
  };

  const issues = data?.content || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/50 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <AlertTriangle className="text-amber-500" size={32} />
            Báo cáo sự cố
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Quản lý và giải quyết các sự cố cơ sở vật chất từ sinh viên.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="Tìm kiếm theo ID..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 pl-10 pr-10 rounded-xl focus:outline-none focus:border-amber-500 transition-colors"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="OPEN">Đang chờ xử lý</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
            <Filter className="absolute left-3 top-3 text-zinc-500" size={18} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500 text-center py-10">Đang tải...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">Lỗi khi tải dữ liệu</div>
      ) : issues.length === 0 ? (
        <div className="bg-zinc-50/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/50 p-12 text-center">
          <CheckCircle2 className="mx-auto text-zinc-600 mb-4" size={48} />
          <h3 className="text-xl font-medium text-zinc-700 dark:text-zinc-300">Không có sự cố nào</h3>
          <p className="text-zinc-500 mt-2">Tuyệt vời! Mọi thứ đều đang hoạt động tốt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue: FacilityIssue) => (
            <div key={issue.id} className="bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5
                  ${issue.status === 'RESOLVED' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : issue.status === 'IN_PROGRESS'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {issue.status === 'RESOLVED' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {issue.status === 'RESOLVED' ? 'Đã giải quyết' : issue.status === 'IN_PROGRESS' ? 'Đang xử lý' : 'Đang chờ'}
                </span>
                <span className="text-xs text-zinc-500 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(issue.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">{issue.category}</div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {issue.description}
                </h3>
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-200/80 dark:border-zinc-800/50 flex justify-between items-center">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="text-zinc-500">Tòa:</span> {issue.buildingId?.substring(0, 8) || '—'}
                  {issue.roomId && <><span className="text-zinc-500 ml-2">Phòng:</span> {issue.roomId.substring(0, 8)}</>}
                </div>
                
                {issue.status !== 'RESOLVED' && (
                  <button
                    onClick={() => resolveIssue(issue.id)}
                    className="bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    Đánh dấu xong
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.totalPages > 0 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={10}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
