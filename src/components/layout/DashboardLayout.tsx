import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Navigation Header */}
        <header className="h-16 px-6 lg:px-8 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex-1 flex items-center">
            {/* Optional breadcrumbs or page title could go here */}
            <div className="hidden md:flex relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="w-64 pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all text-sm text-zinc-200 placeholder-zinc-500 focus:w-80"
              />
            </div>
          </div>
          {/* Right Section */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-zinc-400 hover:text-emerald-400 transition-colors rounded-full hover:bg-emerald-400/10">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
            
            <div className="h-8 w-px bg-zinc-800"></div>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-zinc-200">{user?.username || 'Admin'}</span>
                <span className="text-xs text-emerald-500 font-medium tracking-wider">{user?.role}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center border-2 border-zinc-900">
                  <span className="text-emerald-500 font-bold text-sm">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="ml-2 p-2 text-zinc-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
                title="Logout"
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
