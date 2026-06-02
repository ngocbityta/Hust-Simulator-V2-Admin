import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Map, 
  Building2, 
  Box,
  Users, 
  CalendarRange, 
  CalendarDays, 
  Menu, 
  X,
  Activity,
  BarChart3
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: BarChart3 },
  { label: 'Heatmap', path: '/heatmap', icon: Map },
  { label: 'Buildings', path: '/buildings', icon: Building2 },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Events', path: '/events', icon: CalendarDays },
  { label: 'Recurring Events', path: '/recurring-events', icon: CalendarRange },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
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
        bg-zinc-950/80 backdrop-blur-md border-r border-zinc-800/50 
        transition-transform duration-300 ease-in-out z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <Activity className="w-6 h-6 text-emerald-500 mr-3" />
          <h1 className="text-zinc-100 font-semibold tracking-wide">HustSim Admin</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
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
                  flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                  }
                `}
              >
                <Icon 
                  size={18} 
                  className={`
                    mr-3 transition-colors duration-200
                    ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}
                  `} 
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-zinc-800/50">
          <div className="flex items-center px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-zinc-200">Admin</p>
              <p className="text-xs text-zinc-500">Superuser</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
