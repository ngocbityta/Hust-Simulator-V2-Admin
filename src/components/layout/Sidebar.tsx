import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Map, 
  Building2, 
  Users, 
  CalendarRange, 
  CalendarDays, 
  Menu, 
  X,
  Activity,
  BarChart3,
  AlertTriangle,
  Sun,
  Moon,
  BrainCircuit,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Bản đồ mật độ', path: '/heatmap', icon: Map },
  { label: 'Quản lý Tòa nhà', path: '/buildings', icon: Building2 },
  { label: 'Quản lý Người dùng', path: '/users', icon: Users },
  { label: 'Quản lý Sự kiện', path: '/events', icon: CalendarDays },
  { label: 'Quản lý Lớp học ảo', path: '/recurring-events', icon: CalendarRange },
  { label: 'Quản lý Sự cố', path: '/issues', icon: AlertTriangle },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user: authUser } = useAuth();
  const { showToast } = useToast();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-white transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen flex flex-col
        bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 
        transition-all duration-300 ease-in-out z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none overflow-visible
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        ${!isCollapsed ? 'md:translate-x-0 md:w-64' : 'md:translate-x-0 md:w-20'}
      `}>
        {/* Toggle Collapse Button (Desktop) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`
              hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 
              bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700
              rounded-full items-center justify-center text-zinc-500 hover:text-emerald-500
              hover:border-emerald-500 transition-all shadow-sm z-50
            `}
            title={isCollapsed ? "Mở menu" : "Thu gọn menu"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        )}
        {/* Logo Area */}
        <div className={`h-16 flex items-center border-b border-zinc-200/50 dark:border-zinc-800/50 overflow-hidden whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-6'}`}>
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 ${!isCollapsed ? 'mr-3' : ''}`}>
            <Activity className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          {!isCollapsed && (
            <h1 className="text-zinc-900 dark:text-zinc-100 font-bold tracking-wide text-lg">
              HustSim <span className="text-emerald-500 font-light">Admin</span>
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-6 space-y-1.5 ${isCollapsed ? 'px-3' : 'px-4'}`}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`
                  relative flex items-center py-2.5 rounded-xl transition-all duration-300 group overflow-hidden
                  ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                  ${isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm shadow-emerald-500/5' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
                <Icon 
                  size={18} 
                  className={`
                    transition-colors duration-300 flex-shrink-0
                    ${!isCollapsed ? 'mr-3' : ''}
                    ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}
                  `} 
                />
                {!isCollapsed && <span className="z-10 whitespace-nowrap">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className={`p-4 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-2 overflow-hidden ${isCollapsed ? 'px-2 flex flex-col items-center' : ''}`}>
          <button
            title={isCollapsed ? "Cập nhật trọng số AI" : undefined}
            onClick={async () => {
              if (window.confirm('Bạn có chắc chắn muốn tính toán lại bộ trọng số (Alpha, Beta, Gamma, Delta) cho toàn hệ thống không?\nQuá trình này sẽ phân tích dữ liệu di chuyển mới nhất để tìm ra quy luật chung mới.')) {
                try {
                  const { apiFetch } = await import('../../utils/api');
                  await apiFetch('/prediction-data/train', { method: 'POST' });
                  showToast('Đã gửi lệnh cập nhật trọng số thành công. Quá trình sẽ chạy ngầm.', 'success');
                } catch (e: any) {
                  showToast(e.message || 'Lỗi khi gửi lệnh cập nhật trọng số', 'error');
                }
              }
            }}
            className={`flex items-center py-2 w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            <BrainCircuit size={18} className={`text-zinc-400 group-hover:text-emerald-500 transition-colors flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
            {!isCollapsed && <span className="font-medium whitespace-nowrap">Cập nhật trọng số AI</span>}
          </button>

          <button
            title={isCollapsed ? (theme === 'dark' ? "Chế độ sáng" : "Chế độ tối") : undefined}
            onClick={toggleTheme}
            className={`flex items-center py-2 w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-300 group ${isCollapsed ? 'justify-center px-0' : 'px-3'}`}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={18} className={`text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span className="font-medium whitespace-nowrap">Chế độ sáng</span>}
              </>
            ) : (
              <>
                <Moon size={18} className={`text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors flex-shrink-0 ${!isCollapsed ? 'mr-3' : ''}`} />
                {!isCollapsed && <span className="font-medium whitespace-nowrap">Chế độ tối</span>}
              </>
            )}
          </button>

          <div className={`flex items-center rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer w-full overflow-hidden ${isCollapsed ? 'justify-center p-2 mt-2' : 'px-3 py-3 mt-1'}`}>
            <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
              {(authUser?.username || 'A').charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate">{authUser?.username || 'Admin'}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 truncate">{authUser?.role === 'ADMIN' ? 'Quản trị viên' : authUser?.role || 'Người dùng'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
