import React from 'react';
import { useStore } from '../../store/useStore';
import { Check, X, Minus, Camera, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function ChecklistOverlay() {
  const { currentSession, activeZone, setActiveZone, recordResult, endSession, token } = useStore();
  const [submitting, setSubmitting] = React.useState(false);

  if (!currentSession) {
    return (
      <div className="h-full w-full flex items-center justify-center p-6 text-center">
        <p className="text-metallic-500 font-medium">Select a vehicle and start inspection to view checklist.</p>
      </div>
    );
  }

  const submitInspection = async () => {
    if (!currentSession.backendSessionId || !token) {
      endSession();
      return;
    }

    setSubmitting(true);
    try {
      const items = Object.entries(currentSession.results).map(([templateItemId, val]) => ({
        templateItemId,
        result: val.result,
        notes: val.notes
      }));

      if (items.length > 0) {
        await fetch(`/api/sessions/${currentSession.backendSessionId}/check-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items })
        });
      }

      await fetch(`/api/sessions/${currentSession.backendSessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
    } catch (e) {
      console.error('Failed to submit inspection:', e);
    } finally {
      setSubmitting(false);
      endSession();
    }
  };

  // Filter items by current 3D zone
  const zoneItems = currentSession.template.items.filter(item => item.zone === activeZone);
  
  // Calculate overall progress
  const totalItems = currentSession.template.items.length;
  const completedItems = Object.keys(currentSession.results).length;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  const ZONE_NAMES = {
    'engine': 'Engine Bay',
    'front-left': 'Front Left Zone',
    'front-right': 'Front Right Zone',
    'rear-left': 'Rear Left Zone',
    'rear-right': 'Rear Right Zone',
    'undercarriage': 'Undercarriage',
    'overview': 'General Overview'
  };

  const handleResult = (itemId, result) => {
    recordResult(itemId, result);
    // In a real app, auto-advance to next zone if all items in current zone are done
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Progress Header */}
      <div className="glass-panel rounded-2xl p-5 shrink-0">
        <div className="flex justify-between items-end mb-3">
          <div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Inspection Progress</h3>
            <div className="text-2xl font-display font-bold text-white">{progressPercent}%</div>
          </div>
          <div className="text-sm font-medium text-slate-500">
            {completedItems} / {totalItems} items
          </div>
        </div>
        <div className="w-full h-1.5 bg-metallic-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gold-500 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Zone Checklist */}
      <div className="glass-panel-active rounded-2xl p-1 flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="p-4 border-b border-metallic-700/50 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-display font-bold text-gold-400">{ZONE_NAMES[activeZone] || 'Zone Checklist'}</h2>
          <span className="text-xs font-semibold bg-metallic-800 px-2 py-1 rounded text-slate-300">{zoneItems.length} items</span>
        </div>

        <div className="overflow-y-auto p-2 flex-1 scroll-smooth">
          {zoneItems.length === 0 ? (
            <div className="text-center py-10 text-sm text-slate-500">No items for this zone.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {zoneItems.map(item => {
                const isDone = !!currentSession.results[item.id];
                const res = currentSession.results[item.id]?.result;

                return (
                  <div key={item.id} className={clsx(
                    "p-4 rounded-xl border transition-all duration-200",
                    isDone ? "bg-metallic-800/40 border-metallic-700" : "bg-metallic-800/80 border-metallic-600 shadow-md"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-gold-600 mb-1 block">{item.category}</span>
                        <h4 className="font-semibold text-white text-sm">{item.itemName}</h4>
                      </div>
                      <button className="text-slate-500 hover:text-gold-400 p-1 bg-metallic-900 rounded-md">
                        <Camera size={14} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-400 mb-4">{item.guideline}</p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResult(item.id, 'PASS')}
                        className={clsx(
                          "flex-1 py-2 flex justify-center items-center rounded-lg border text-xs font-bold transition-colors",
                          res === 'PASS' 
                            ? "bg-green-500/20 border-green-500 text-green-400" 
                            : "bg-metallic-900 border-metallic-700 text-slate-500 hover:border-green-500/50 hover:text-green-400"
                        )}
                      >
                        <Check size={14} className="mr-1" /> PASS
                      </button>
                      <button 
                        onClick={() => handleResult(item.id, 'FAIL')}
                        className={clsx(
                          "flex-1 py-2 flex justify-center items-center rounded-lg border text-xs font-bold transition-colors",
                          res === 'FAIL' 
                            ? "bg-red-500/20 border-red-500 text-red-400" 
                            : "bg-metallic-900 border-metallic-700 text-slate-500 hover:border-red-500/50 hover:text-red-400"
                        )}
                      >
                        <X size={14} className="mr-1" /> FAIL
                      </button>
                      <button 
                        onClick={() => handleResult(item.id, 'NA')}
                        className={clsx(
                          "w-12 flex justify-center items-center rounded-lg border text-xs font-bold transition-colors",
                          res === 'NA' 
                            ? "bg-slate-500/20 border-slate-500 text-slate-400" 
                            : "bg-metallic-900 border-metallic-700 text-slate-500 hover:border-slate-500/50 hover:text-slate-400"
                        )}
                      >
                        <Minus size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next Zone Guidance */}
        <div className="p-3 border-t border-metallic-700/50 bg-metallic-900/30 shrink-0">
          <button 
            disabled={submitting}
            onClick={() => {
              if (progressPercent === 100) {
                submitInspection();
              } else {
                // Simple zone cycler for demo
                const zones = ['engine', 'front-left', 'front-right', 'rear-right', 'rear-left', 'undercarriage'];
                const idx = zones.indexOf(activeZone);
                if (idx < zones.length - 1) setActiveZone(zones[idx + 1]);
                else setActiveZone('overview');
              }
            }}
            className="w-full py-3 bg-metallic-800 hover:bg-metallic-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors border border-metallic-600 disabled:opacity-50"
          >
            {submitting ? 'SUBMITTING...' : (progressPercent === 100 ? 'COMPLETE INSPECTION' : 'NEXT ZONE')}
            {!submitting && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
