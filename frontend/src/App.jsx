import React from 'react';
import Sidebar from './components/Sidebar';
import GarageView from './views/GarageView';
import LoginView from './views/LoginView';
import CustomersView from './views/CustomersView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import AnalyticsView from './views/AnalyticsView';
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
        {activeView === 'garage' && <GarageView />}
        {activeView === 'customers' && <CustomersView />}
        {activeView === 'history' && <HistoryView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
