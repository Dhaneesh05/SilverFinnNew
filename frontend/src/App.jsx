import React from 'react';
import Sidebar from './components/Sidebar';
import GarageView from './views/GarageView';
import LoginView from './views/LoginView';
import CustomersView from './views/CustomersView';
import { useStore } from './store/useStore';

export default function App() {
  const activeView = useStore(state => state.activeView);
  const token = useStore(state => state.token);

  if (!token) {
    return <LoginView />;
  }

  return (
    <div className="w-screen h-screen flex bg-metallic-900 text-slate-200 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 relative overflow-hidden">
        {/* Simple router for now */}
        {activeView === 'garage' && <GarageView />}
        {activeView === 'customers' && <CustomersView />}
        {activeView === 'history' && (
          <div className="p-8"><h1 className="text-3xl font-display font-semibold text-gradient-gold">Service History</h1></div>
        )}
        {activeView === 'settings' && (
          <div className="p-8"><h1 className="text-3xl font-display font-semibold text-gradient-gold">Settings</h1></div>
        )}
      </main>
    </div>
  );
}
