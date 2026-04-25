import React, { useEffect, useState } from 'react';
import { Car, Wrench, AlertTriangle, Play, Gauge, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function VehicleInfoOverlay() {
  const { currentSession, startSession, endSession, token, selectedVehicle } = useStore();
  const [alerts, setAlerts] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showChecklistPicker, setShowChecklistPicker] = useState(false);
  const [starting, setStarting] = useState(false);

  const vehicle = currentSession?.vehicle || selectedVehicle;

  // Fetch alerts for the active vehicle
  useEffect(() => {
    if (!vehicle?.id || !token) return;
    fetch(`/api/alerts?vehicleId=${vehicle.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => setAlerts([]));
  }, [vehicle?.id, token]);

  // Fetch available checklist templates
  useEffect(() => {
    if (!token) return;
    fetch('/api/checklists/templates', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setChecklists(list);
        if (list.length > 0) setSelectedChecklist(list[0]);
      })
      .catch(() => {});
  }, [token]);

  const handleStartInspection = async () => {
    if (!vehicle || !selectedChecklist) return;
    setStarting(true);

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          mileageAtVisit: vehicle.currentMileage || 0,
          serviceType: selectedChecklist.serviceType ?? 'INSPECTION',
          notes: `Inspection started via Silver Finn Garage`
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const session = await res.json();

      // Store session ID so checklist overlay can submit results
      startSession(
        { ...vehicle, backendSessionId: session.id },
        selectedChecklist
      );
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setStarting(false);
      setShowChecklistPicker(false);
    }
  };

  // If no session is active, show a "Select Vehicle" prompt
  if (!vehicle) {
    return (
      <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center gap-3 min-h-[200px] text-center">
        <div className="w-12 h-12 rounded-xl bg-metallic-800 flex items-center justify-center">
          <Car size={24} className="text-metallic-500" />
        </div>
        <p className="text-sm text-slate-400 font-medium">No vehicle selected.</p>
        <p className="text-xs text-slate-500">Go to <span className="text-gold-400 font-semibold">Customers</span> and click<br /><span className="text-gold-400 font-semibold">START SESSION</span> on a vehicle.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-5">
      {/* Vehicle Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-metallic-700 flex items-center justify-center">
            <Car size={20} className="text-gold-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">{vehicle.plateNumber}</h2>
            <p className="text-sm text-slate-400 font-medium">{vehicle.make} {vehicle.model} · {vehicle.year}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-3 p-3 bg-metallic-900/50 rounded-xl border border-metallic-700/50">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider flex items-center gap-1.5">
            <Gauge size={12} /> Odometer
          </span>
          <span className="text-sm font-bold text-white font-mono">
            {(vehicle.currentMileage ?? 0).toLocaleString()} km
          </span>
        </div>
      </div>

      {/* AI Predictive Alerts */}
      {alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h3 className="text-sm font-bold text-red-400">AI Predictive Alerts</h3>
          </div>
          <div className="space-y-1">
            {alerts.slice(0, 3).map(a => (
              <div key={a.id} className="text-xs text-red-200/80 flex justify-between">
                <span>{a.alertType.replace(/_/g, ' ')}</span>
                <span className="font-mono">{Math.round(a.probability * 100)}% prob.</span>
              </div>
            ))}
            {alerts.length > 3 && (
              <div className="text-xs text-red-300/60 mt-1">+{alerts.length - 3} more alerts</div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!currentSession?.backendSessionId ? (
        <>
          {/* Checklist Picker */}
          {showChecklistPicker && (
            <div className="bg-metallic-800/70 border border-metallic-700 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Template</p>
              {checklists.map(cl => (
                <button
                  key={cl.id}
                  onClick={() => setSelectedChecklist(cl)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                    selectedChecklist?.id === cl.id
                      ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50'
                      : 'text-slate-300 hover:bg-metallic-700 border border-transparent'
                  }`}
                >
                  <span>{cl.name}</span>
                  <span className="text-xs text-slate-500">{cl.serviceType}</span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowChecklistPicker(!showChecklistPicker)}
            className="w-full py-2 rounded-xl bg-metallic-800 hover:bg-metallic-700 text-slate-300 text-sm font-semibold flex items-center justify-between px-4 border border-metallic-700 transition-colors"
          >
            <span>{selectedChecklist?.name ?? 'No template selected'}</span>
            <ChevronRight size={16} className="text-slate-500" />
          </button>

          <button
            onClick={handleStartInspection}
            disabled={starting || !selectedChecklist}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 disabled:opacity-50 text-metallic-900 font-bold tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
          >
            {starting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-metallic-900 border-t-transparent rounded-full animate-spin" />
                STARTING...
              </span>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                START INSPECTION
              </>
            )}
          </button>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="w-full py-4 rounded-xl bg-metallic-700/50 border border-metallic-600 text-gold-400 font-bold tracking-wide flex items-center justify-center gap-2">
            <Wrench size={18} />
            SESSION IN PROGRESS
          </div>
          <button
            onClick={() => endSession()}
            className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors"
          >
            End Session
          </button>
        </div>
      )}
    </div>
  );
}
