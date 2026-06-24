import React, { useState, useEffect } from 'react';
import { useFetch } from '../hooks/useFetch';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Plus, Loader2 } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { EditUserModal } from '../components/user/EditUserModal';

export const UsersPage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;
  const navigate = useNavigate();

  const [editingUser, setEditingUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const endpoint = `/users/paged?page=${page}&size=${size}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`;
  const { data, error, isLoading } = useFetch<any>(endpoint);
  
  const users = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Users className="text-blue-500" size={32} />
            Quản lý Người dùng
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Quản lý người chơi và các thực thể mô phỏng</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          Thêm Người dùng
        </button>
      </div>

      <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
            <input 
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-zinc-500">
            <Loader2 className="animate-spin mr-3" size={24} />
            Đang tải danh sách người dùng...
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
                  <th className="pb-4 font-medium px-4">Người dùng</th>
                  <th className="pb-4 font-medium px-4">Số điện thoại</th>
                  <th className="pb-4 font-medium px-4">User ID</th>
                  <th className="pb-4 font-medium px-4">Vai trò</th>
                  <th className="pb-4 font-medium px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr 
                    key={user.id} 
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-zinc-200/80 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/20 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.username || 'U'}&background=random`} 
                          alt={user.username} 
                          className="w-10 h-10 rounded-full border border-zinc-300 dark:border-zinc-700 object-cover"
                        />
                        <div>
                          <p className="font-semibold">{user.fullName || user.username || 'Unknown'}</p>
                          {user.fullName && <p className="text-xs text-zinc-500">@{user.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-sm">{user.phonenumber}</td>
                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-mono text-xs">{user.id}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                        user.role === 'ADMIN' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role || 'USER'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingUser(user);
                            setIsModalOpen(true);
                          }}
                          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-amber-500 px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                        >
                          Sửa
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/users/${user.id}`);
                          }}
                          className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-blue-500 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                        >
                          Quản lý hành trình
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-500">
                      Không tìm thấy người dùng nào phù hợp.
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
        <EditUserModal 
          user={editingUser} 
          onClose={() => {
            setEditingUser(null);
            setIsModalOpen(false);
          }}
          onSuccess={() => {
            setEditingUser(null);
            setIsModalOpen(false);
            // Reload page by slightly triggering search or we could add a refetch to useFetch if it returned one.
            // For now, triggering a tiny timeout search reset
            const current = searchInput;
            setSearchInput(current + ' ');
            setTimeout(() => setSearchInput(current), 50);
          }}
        />
      )}
    </div>
  );
};
