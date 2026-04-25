import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  User, Shield, Bell, Palette, Database, ChevronRight,
  Save, LogOut, AlertTriangle, Check
} from 'lucide-react';

function SettingsSection({ title, icon: Icon, children }) {
  return (
    <div className="glass-panel border border-metallic-700/50 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
          <Icon size={16} className="text-gold-400" />
        </div>
        <h2 className="font-display font-bold text-slate-100">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-metallic-700/30 last:border-0">
      <div>
        <div className="text-sm font-medium text-slate-200">{label}</div>
        {description && <div className="text-xs text-slate-500 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full transition-all relative ${value ? 'bg-gold-500' : 'bg-metallic-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

export default function SettingsView() {
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);

  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    predictiveAlerts: true,
    sessionReminders: true,
    weeklyReport: false,
  });

  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-metallic-900 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-bold text-gradient-gold mb-1">Settings</h1>
          <p className="text-slate-400 text-sm">Manage your account, preferences, and system configuration.</p>
        </div>

        {/* Profile */}
        <SettingsSection title="Profile" icon={User}>
          <div className="flex items-center gap-4 mb-5 p-4 bg-metallic-800/40 rounded-xl border border-metallic-700">
            <div className="w-14 h-14 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center text-metallic-900 font-bold text-xl font-display">
              {(user?.name ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-100">{user?.name ?? 'Unknown User'}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
              <div className="text-xs mt-1">
                <span className={`px-2 py-0.5 rounded-full border text-xs font-bold ${
                  user?.role === 'ADMIN'
                    ? 'text-gold-400 bg-gold-500/10 border-gold-500/30'
                    : 'text-sky-400 bg-sky-500/10 border-sky-500/30'
                }`}>
                  {user?.role ?? 'MECHANIC'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-gold-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 w-full bg-metallic-900 border border-metallic-700 text-slate-500 text-sm rounded-lg px-4 py-2.5 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-5 flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-metallic-900 font-bold text-sm rounded-lg transition-colors"
          >
            {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Changes</>}
          </button>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={Bell}>
          <ToggleRow
            label="Predictive Maintenance Alerts"
            description="Get notified when AI detects upcoming part failures"
            value={notifications.predictiveAlerts}
            onChange={(v) => setNotifications(prev => ({ ...prev, predictiveAlerts: v }))}
          />
          <ToggleRow
            label="Session Reminders"
            description="Reminder notifications for scheduled services"
            value={notifications.sessionReminders}
            onChange={(v) => setNotifications(prev => ({ ...prev, sessionReminders: v }))}
          />
          <ToggleRow
            label="Weekly Revenue Report"
            description="Receive a summary of workshop performance every Monday"
            value={notifications.weeklyReport}
            onChange={(v) => setNotifications(prev => ({ ...prev, weeklyReport: v }))}
          />
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" icon={Shield}>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-metallic-800/50 border border-metallic-700 rounded-lg hover:border-metallic-600 transition-colors text-sm text-slate-300">
              <span>Change Password</span>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-metallic-800/50 border border-metallic-700 rounded-lg hover:border-metallic-600 transition-colors text-sm text-slate-300">
              <span>Active Sessions</span>
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </div>
        </SettingsSection>

        {/* System */}
        <SettingsSection title="System" icon={Database}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-metallic-700/30">
              <span className="text-slate-400">Platform</span>
              <span className="text-slate-200 font-mono">Silver Finn v1.0.4-rc</span>
            </div>
            <div className="flex justify-between py-2 border-b border-metallic-700/30">
              <span className="text-slate-400">AI Engine</span>
              <span className="text-slate-200 font-mono">ZhipuAI GLM-4</span>
            </div>
            <div className="flex justify-between py-2 border-b border-metallic-700/30">
              <span className="text-slate-400">Database</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block animate-pulse" />
                PostgreSQL · Connected
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Workshop ID</span>
              <span className="text-slate-500 font-mono text-xs">{user?.workshopId ?? 'N/A'}</span>
            </div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <div className="glass-panel border border-red-500/20 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400" />
            </div>
            <h2 className="font-display font-bold text-red-400">Danger Zone</h2>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold text-sm rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign Out of Silver Finn
          </button>
        </div>
      </div>
    </div>
  );
}
