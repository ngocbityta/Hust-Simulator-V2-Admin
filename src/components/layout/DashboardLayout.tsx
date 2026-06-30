import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navigation Header */}
        <header className="h-16 px-6 lg:px-8 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-30 shadow-sm dark:shadow-none">
          <div className="flex-1 flex items-center gap-4">
            {/* Optional breadcrumbs or page title could go here */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors duration-300" size={18} />
              <input 
                type="text" 
                placeholder="Tìm kiếm toàn hệ thống..." 
                className="w-64 pl-10 pr-4 py-2 bg-zinc-100/50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all duration-300 ease-out text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:w-80 shadow-inner"
              />
            </div>
          </div>
          {/* Right Section */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-300 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-500/10">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
            </button>
            
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{user?.username || 'Admin'}</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase">{user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role || ''}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 p-0.5 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow duration-300 cursor-pointer">
                <div className="w-full h-full bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center border-[1.5px] border-white dark:border-zinc-900">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="ml-2 p-2 text-zinc-400 hover:text-red-500 transition-colors duration-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
