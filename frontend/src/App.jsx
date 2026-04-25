import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';

// Views
import LoginView from './views/LoginView';
import GarageView from './views/GarageView';
import CustomersView from './views/CustomersView';
import HistoryView from './views/HistoryView';
import SettingsView from './views/SettingsView';
import AnalyticsView from './views/AnalyticsView';

// Components
import Sidebar from './components/Sidebar';
import LoadingScreen from './components/LoadingScreen';

/**
 * AuthRoute — Protects routes behind authentication.
 * Redirects to /login if no token exists.
 */
function AuthRoute({ children }) {
  const token = useStore(state => state.token);
  if (!token) return <Navigate to="/login" replace />;
  return children || <Outlet />;
}

/**
 * DashboardLayout — Sidebar + routed content area.
 * Used by all dashboard-level routes.
 */
function DashboardLayout() {
  return (
    <div className="w-screen h-screen flex bg-metallic-900 text-slate-200 overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}

/**
 * LoadingRoute — Shows the Forza Horizon loading screen,
 * then navigates to the dashboard.
 */
function LoadingRoute() {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const handleFinished = useCallback(() => {
    setDone(true);
    navigate('/dashboard/garage', { replace: true });
  }, [navigate]);

  if (done) return null;

  return <LoadingScreen duration={10000} onFinished={handleFinished} />;
}

/**
 * App — Root component with URL-based routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginView />} />

        {/* Loading screen (shown after login) */}
        <Route path="/loading" element={<AuthRoute><LoadingRoute /></AuthRoute>} />

        {/* Protected: Dashboard with Sidebar */}
        <Route element={<AuthRoute><DashboardLayout /></AuthRoute>}>
          <Route path="/dashboard/garage" element={<GarageView />} />
          <Route path="/dashboard/customers" element={<CustomersView />} />
          <Route path="/dashboard/history" element={<HistoryView />} />
          <Route path="/dashboard/analytics" element={<AnalyticsView />} />
          <Route path="/dashboard/settings" element={<SettingsView />} />
        </Route>

        {/* Catch-all → loading screen (or login if not authenticated) */}
        <Route path="*" element={<Navigate to="/loading" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
