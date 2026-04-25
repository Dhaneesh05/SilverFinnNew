import React from 'react';
import { Home, ClipboardList, Clock, Settings, LogOut, BarChart2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard/garage', icon: Home, label: 'Garage' },
    { path: '/dashboard/customers', icon: ClipboardList, label: 'Customers' },
    { path: '/dashboard/history', icon: Clock, label: 'History' },
    { path: '/dashboard/analytics', icon: BarChart2, label: 'Analytics' },
  ];

  const handleLogout = () => {
    useStore.getState().logout();
    navigate('/login');
  };

  return (
    <div className="w-20 h-full glass-panel flex flex-col items-center py-6 z-50">
      {/* Logo */}
      <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-lg mb-8">
        <span className="font-display font-bold text-metallic-900 text-xl">SF</span>
      </div>



      {/* Main Nav */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={clsx('nav-item group relative', location.pathname === item.path && 'active')}
            title={item.label}
          >
            <item.icon size={22} className="relative z-10" />
            
            {/* Tooltip */}
            <span className="absolute left-14 bg-metallic-800 text-white px-3 py-1.5 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-metallic-700 shadow-xl">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom Nav */}
      <div className="flex flex-col gap-4 w-full px-4 mt-auto">
        <button 
          onClick={() => navigate('/dashboard/settings')}
          className={clsx('nav-item', location.pathname === '/dashboard/settings' && 'active')}
        >
          <Settings size={22} />
        </button>
        <button onClick={handleLogout} className="nav-item hover:!text-red-400 hover:!bg-red-500/10">
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
