import React from 'react';
import { Home, ClipboardList, Clock, Settings, LogOut } from 'lucide-react';
import { useStore } from '../store/useStore';
import clsx from 'clsx';

export default function Sidebar() {
  const { activeView, setActiveView } = useStore();

  const navItems = [
    { id: 'garage', icon: Home, label: 'Garage' },
    { id: 'customers', icon: ClipboardList, label: 'Customers' },
    { id: 'history', icon: Clock, label: 'History' },
  ];

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
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={clsx('nav-item group relative', activeView === item.id && 'active')}
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
          onClick={() => setActiveView('settings')}
          className={clsx('nav-item', activeView === 'settings' && 'active')}
        >
          <Settings size={22} />
        </button>
        <button onClick={() => useStore.getState().logout()} className="nav-item hover:!text-red-400 hover:!bg-red-500/10">
          <LogOut size={22} />
        </button>
      </div>
    </div>
  );
}
