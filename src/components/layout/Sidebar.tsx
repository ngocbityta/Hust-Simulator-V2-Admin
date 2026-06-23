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
  BrainCircuit
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Bản đồ mật độ', path: '/heatmap', icon: Map },
  { label: 'Quản lý Tòa nhà', path: '/buildings', icon: Building2 },
  { label: 'Quản lý Người dùng', path: '/users', icon: Users },
  { label: 'Quản lý Sự kiện', path: '/events', icon: CalendarDays },
  { label: 'Quản lý Lớp học ảo', path: '/recurring-events', icon: CalendarRange },
  { label: 'Quản lý Sự cố', path: '/issues', icon: AlertTriangle },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
        fixed md:sticky top-0 left-0 h-screen w-64 flex flex-col
        bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 
        transition-transform duration-300 ease-in-out z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          <div className="relative flex items-center justify-center w-8 h-8 mr-3 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Activity className="w-5 h-5 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <h1 className="text-zinc-900 dark:text-zinc-100 font-bold tracking-wide text-lg">HustSim <span className="text-emerald-500 font-light">Admin</span></h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            // Highlight parent paths if exact match isn't suitable, but here we just use strict equality or startsWith for root.
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden
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
                    mr-3 transition-colors duration-300
                    ${isActive ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'}
                  `} 
                />
                <span className="z-10">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-2">
          <button
            onClick={async () => {
              try {
                const { apiFetch } = await import('../../utils/api');
                await apiFetch('/prediction-data/train', { method: 'POST' });
                alert('Đã gửi lệnh huấn luyện lại Model STTF bằng dữ liệu mới nhất. Quá trình này sẽ chạy ngầm và mất một lúc.');
              } catch (e) {
                alert('Có lỗi xảy ra khi gửi lệnh huấn luyện: ' + e);
              }
            }}
            className="flex items-center px-3 py-2 w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 group"
          >
            <BrainCircuit size={18} className="mr-3 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
            <span className="font-medium">Huấn luyện lại AI</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center px-3 py-2 w-full rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-300 group"
          >
            {theme === 'dark' ? (
              <>
                <Sun size={18} className="mr-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                <span className="font-medium">Chế độ sáng</span>
              </>
            ) : (
              <>
                <Moon size={18} className="mr-3 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                <span className="font-medium">Chế độ tối</span>
              </>
            )}
          </button>

          <div className="flex items-center px-3 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">Admin User</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Superuser</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
