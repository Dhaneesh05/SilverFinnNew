import React from 'react';
import { Car, Wrench, AlertTriangle, Play } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function VehicleInfoOverlay() {
  const { currentSession, startSession } = useStore();

  // Mock data for demo (would come from API via vehicle selection)
  const vehicle = {
    make: 'Toyota',
    model: 'Vios 1.5G',
    plateNumber: 'VHA 8114',
    currentMileage: 42500,
    alerts: [
      { id: 1, type: 'Brake Pads Due', prob: 0.85 }
    ]
  };

  const template = {
    name: '40,000km Major Service',
    items: [
      { id: '1', zone: 'engine', category: 'Fluids', itemName: 'Engine Oil', guideline: 'Check colour and level.' },
      { id: '2', zone: 'front-left', category: 'Tyres', itemName: 'FL Tyre Tread', guideline: 'Minimum 1.6mm depth.' },
      { id: '3', zone: 'front-right', category: 'Tyres', itemName: 'FR Tyre Tread', guideline: 'Minimum 1.6mm depth.' },
      { id: '4', zone: 'undercarriage', category: 'Brakes', itemName: 'Brake Pads', guideline: 'Minimum 3mm thickness.' },
    ]
  };

  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
      {/* Vehicle Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-metallic-700 flex items-center justify-center">
            <Car size={20} className="text-gold-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">{vehicle.plateNumber}</h2>
            <p className="text-sm text-slate-400 font-medium">{vehicle.make} {vehicle.model}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4 p-3 bg-metallic-900/50 rounded-xl border border-metallic-700/50">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Odometer</span>
          <span className="text-sm font-bold text-white font-mono">{vehicle.currentMileage.toLocaleString()} km</span>
        </div>
      </div>

      {/* AI Predictive Alerts */}
      {vehicle.alerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <h3 className="text-sm font-bold text-red-400">AI Predictive Alerts</h3>
          </div>
          {vehicle.alerts.map(a => (
            <div key={a.id} className="text-xs text-red-200/80 flex justify-between">
              <span>{a.type}</span>
              <span className="font-mono">{Math.round(a.prob * 100)}% prob.</span>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {!currentSession ? (
        <button 
          onClick={() => startSession(vehicle, template)}
          className="mt-auto w-full py-4 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-metallic-900 font-bold tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <Play size={18} fill="currentColor" />
          START INSPECTION
        </button>
      ) : (
        <div className="mt-auto w-full py-4 rounded-xl bg-metallic-700/50 border border-metallic-600 text-gold-400 font-bold tracking-wide flex items-center justify-center gap-2">
          <Wrench size={18} />
          SESSION IN PROGRESS
        </div>
      )}
    </div>
  );
}
