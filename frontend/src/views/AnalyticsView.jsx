import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, ScatterChart, Scatter, ZAxis, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, AlertTriangle, AlertCircle, Loader2, Target, DollarSign } from 'lucide-react';
import clsx from 'clsx';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-metallic-800 border border-metallic-700 p-3 rounded-lg shadow-xl">
        <p className="font-bold text-white mb-1">{data.part}</p>
        <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-wider">{data.category}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <span className="text-slate-400">Frequency:</span>
          <span className="text-white font-medium">{data.frequency} replaced</span>
          <span className="text-slate-400">Avg Mileage:</span>
          <span className="text-white font-medium">{data.mileage.toLocaleString()} km</span>
          <span className="text-slate-400">Failure Prob:</span>
          <span className={data.failureProb > 70 ? 'text-red-400 font-bold' : data.failureProb > 30 ? 'text-gold-400 font-bold' : 'text-emerald-400 font-bold'}>
            {data.failureProb}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function AnalyticsView() {
  const [activeTab, setActiveTab] = useState('workshop'); // 'workshop' | 'alerts'
  const [topParts, setTopParts] = useState([]);
  const [serviceFreq, setServiceFreq] = useState([]);
  const [inspectionFailures, setInspectionFailures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = useStore(state => state.token);

  useEffect(() => {
    if (!token) return;
    
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [partsRes, freqRes, heatRes] = await Promise.all([
          fetch('/api/predictions/analytics/top-parts', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/predictions/analytics/service-frequency', {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch('/api/predictions/analytics/inspection-failures', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        if (partsRes.ok) setTopParts(await partsRes.json());
        if (freqRes.ok) {
          const freqData = await freqRes.json();
          setServiceFreq(freqData.map(f => ({
            name: `${f.make} ${f.model}`,
            count: f.vehicleCount
          })));
        }
        if (heatRes.ok) {
          const data = await heatRes.json();
          setInspectionFailures(data);
        }
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [token]);

  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">Predictive Analytics</h1>
            <p className="text-slate-400">Workshop trends and failure probabilities based on historical session data.</p>
          </div>
          
          <div className="flex bg-metallic-800 p-1 rounded-lg border border-metallic-700">
            <button 
              onClick={() => setActiveTab('workshop')}
              className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === 'workshop' ? "bg-metallic-700 text-white" : "text-slate-400 hover:text-white")}
            >
              Workshop Trends
            </button>
            <button 
              onClick={() => setActiveTab('alerts')}
              className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-colors", activeTab === 'alerts' ? "bg-metallic-700 text-white" : "text-slate-400 hover:text-white")}
            >
              Active Alerts
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-gold-500" size={32} />
          </div>
        )}

        {/* Workshop Trends Tab */}
        {!isLoading && activeTab === 'workshop' && (
          <div className="space-y-6">
            
            {/* Top Parts Lifecycle Chart */}
            <div className="glass-panel-active p-6 flex flex-col h-[450px]">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                <Activity size={18} className="text-gold-500" />
                Parts Lifecycle & Failure Probability
              </h2>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <p className="text-xs text-slate-400">
                  Visualizing replacement frequency, average mileage, and likelihood of failure prior to replacement across service types.
                </p>
                <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider text-slate-400 bg-metallic-900/50 px-3 py-1.5 rounded-lg border border-metallic-700/50 uppercase">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Preventative</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-gold-500"></div> Wear & Tear</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> High Failure</div>
                </div>
              </div>
              
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 40, left: 60, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" />
                    <XAxis type="number" dataKey="mileage" name="Mileage" unit=" km" stroke="#6e7681" tick={{ fill: '#6e7681', fontSize: 12 }} ticks={[0, 30000, 60000, 90000, 120000, 150000]} domain={[0, 'dataMax + 10000']} />
                    <YAxis type="category" dataKey="part" name="Part" stroke="#6e7681" tick={{ fill: '#c9d1d9', fontSize: 12 }} width={120} />
                    <ZAxis type="number" dataKey="frequency" range={[60, 900]} name="Frequency" />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={topParts} name="Parts">
                      {topParts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.failureProb > 70 ? '#ef4444' : entry.failureProb > 30 ? '#D4AF37' : '#10b981'} opacity={0.8} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Service Frequency Chart */}
              <div className="glass-panel-active p-6 flex flex-col h-[400px]">
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <TrendingUp size={18} className="text-gold-500" />
                  Service Volume by Model
                </h2>
                <p className="text-xs text-slate-400 mb-6">Number of distinct vehicles serviced.</p>
                
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={serviceFreq} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" vertical={false} />
                      <XAxis dataKey="name" stroke="#6e7681" tick={{ fill: '#c9d1d9', fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#6e7681" tick={{ fill: '#6e7681', fontSize: 12 }} />
                      <Tooltip 
                        cursor={{ fill: '#2D333B', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: '#1A1D21', borderColor: '#30363D', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#D4AF37' }}
                      />
                      <Bar dataKey="count" name="Vehicles" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Inspection Failures Chart */}
              <div className="glass-panel-active p-6 flex flex-col h-[400px]">
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  Top Inspection Failures
                </h2>
                <p className="text-xs text-slate-400 mb-6">Most frequently failed checklist items across all service sessions.</p>
                
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inspectionFailures} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2D333B" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#6e7681" tick={{ fill: '#6e7681', fontSize: 12 }} />
                      <YAxis type="category" dataKey="item" stroke="#6e7681" tick={{ fill: '#c9d1d9', fontSize: 12 }} width={120} />
                      <Tooltip 
                        cursor={{ fill: '#2D333B', opacity: 0.4 }}
                        contentStyle={{ backgroundColor: '#1A1D21', borderColor: '#30363D', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                        formatter={(value) => [value, 'Failures']}
                      />
                      <Bar dataKey="failCount" name="Failures" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Alerts Tab */}
        {!isLoading && activeTab === 'alerts' && (
          <div className="glass-panel p-8 text-center">
            <AlertTriangle size={48} className="mx-auto text-yellow-500/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fleet-Wide Active Alerts</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              This section is reserved for aggregating ACTIVE predictive alerts across all vehicles currently in the garage queue.
              (Feature expansion required to fetch global alerts).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
