import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import {
  Calendar, Wrench, Car, Clock, CheckCircle, XCircle,
  ChevronDown, ChevronRight, Filter, TrendingUp, DollarSign
} from 'lucide-react';
import clsx from 'clsx';

const SERVICE_TYPE_COLORS = {
  MINOR: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  MAJOR: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  INSPECTION: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const RESULT_ICON = {
  PASS: <CheckCircle size={14} className="text-emerald-400" />,
  FAIL: <XCircle size={14} className="text-red-400" />,
  NA: <span className="w-3.5 h-3.5 rounded-full bg-metallic-600 inline-block" />,
};

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);

  const passCount = session.checkItems?.filter(i => i.result === 'PASS').length ?? 0;
  const failCount = session.checkItems?.filter(i => i.result === 'FAIL').length ?? 0;
  const totalItems = session.checkItems?.length ?? 0;
  const date = new Date(session.sessionDate);

  return (
    <div className="glass-panel border border-metallic-700/50 hover:border-gold-500/20 transition-colors overflow-hidden">
      {/* Session Header */}
      <button
        className="w-full flex items-center gap-4 p-5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 bg-metallic-800 rounded-lg flex items-center justify-center flex-shrink-0">
          <Wrench size={18} className="text-gold-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono font-bold text-slate-100 text-sm">
              {session.vehicle?.plateNumber}
            </span>
            <span className={clsx(
              'text-xs font-bold px-2 py-0.5 rounded border',
              SERVICE_TYPE_COLORS[session.serviceType] ?? 'text-slate-400 bg-metallic-800 border-metallic-600'
            )}>
              {session.serviceType}
            </span>
            {session.isCompleted ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle size={12} /> Completed
              </span>
            ) : (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <Clock size={12} /> In Progress
              </span>
            )}
          </div>

          <div className="text-xs text-slate-400 mt-1 flex gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {date.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Car size={11} />
              {session.vehicle?.make} {session.vehicle?.model}
            </span>
            {session.mechanic && (
              <span>by {session.mechanic.name}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          {/* Pass/Fail mini bar */}
          {totalItems > 0 && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400 mb-1">{passCount}/{totalItems} passed</div>
              <div className="w-24 h-1.5 bg-metallic-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(passCount / totalItems) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Cost */}
          {session.totalCostMyr && (
            <div className="text-right">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-sm font-bold text-gold-400">RM {Number(session.totalCostMyr).toFixed(2)}</div>
            </div>
          )}

          {expanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-metallic-700/50 px-5 pb-5">
          {session.notes && (
            <p className="text-sm text-slate-300 my-4 italic">"{session.notes}"</p>
          )}

          {session.checkItems?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Checklist Results</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {session.checkItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-metallic-800/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      {RESULT_ICON[item.result] ?? RESULT_ICON.NA}
                      <span className="text-xs text-slate-300">{item.templateItem?.itemName ?? 'Item'}</span>
                    </div>
                    <span className="text-xs text-slate-500 capitalize">{item.templateItem?.zone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.replacedParts?.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Replaced Parts</h4>
              <div className="space-y-2">
                {session.replacedParts.map(part => (
                  <div key={part.id} className="flex justify-between items-center bg-metallic-800/50 rounded-lg px-3 py-2">
                    <div>
                      <div className="text-sm text-slate-200">{part.partName}</div>
                      {part.brand && <div className="text-xs text-slate-500">{part.brand} {part.partNumber ? `· ${part.partNumber}` : ''}</div>}
                    </div>
                    <div className="text-sm font-bold text-gold-400">RM {Number(part.costMyr).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryView() {
  const token = useStore(state => state.token);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | MINOR | MAJOR | INSPECTION
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchAllSessions();
  }, []);

  const fetchAllSessions = async () => {
    try {
      // Fetch recent completed sessions across all vehicles
      // We'll use the customers endpoint to get all vehicles, then their sessions
      const res = await fetch('/api/customers?limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();

      const { data: customers } = await res.json();

      // Collect all vehicle IDs
      const vehicleIds = customers.flatMap(c => c.vehicles?.map(v => v.id) ?? []);

      // Fetch sessions for each vehicle (in parallel, limit to first 10 vehicles for now)
      const sessionResults = await Promise.all(
        vehicleIds.slice(0, 10).map(vid =>
          fetch(`/api/sessions?vehicleId=${vid}&limit=10`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(r => r.ok ? r.json() : { data: [] })
        )
      );

      const allSessions = sessionResults.flatMap(r => r.data ?? []);
      allSessions.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));

      setSessions(allSessions);
      setTotalRevenue(allSessions.reduce((sum, s) => sum + (Number(s.totalCostMyr) || 0), 0));
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = filter === 'ALL'
    ? sessions
    : sessions.filter(s => s.serviceType === filter);

  return (
    <div className="w-full h-full flex flex-col bg-metallic-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-8 pb-4 border-b border-metallic-800">
        <h1 className="text-3xl font-display font-bold text-gradient-gold mb-1">Service History</h1>
        <p className="text-slate-400 text-sm">Complete audit log of all service sessions.</p>

        {/* Stats Row */}
        <div className="flex gap-6 mt-6">
          <div className="bg-metallic-800/50 border border-metallic-700 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-gold-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{sessions.length}</div>
              <div className="text-xs text-slate-400">Total Sessions</div>
            </div>
          </div>
          <div className="bg-metallic-800/50 border border-metallic-700 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">{sessions.filter(s => s.isCompleted).length}</div>
              <div className="text-xs text-slate-400">Completed</div>
            </div>
          </div>
          <div className="bg-metallic-800/50 border border-metallic-700 rounded-xl px-5 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-gold-500/10 rounded-lg flex items-center justify-center">
              <DollarSign size={16} className="text-gold-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gold-400">RM {totalRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</div>
              <div className="text-xs text-slate-400">Total Revenue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex-shrink-0 px-8 py-4 flex items-center gap-2">
        <Filter size={14} className="text-slate-500" />
        {['ALL', 'MINOR', 'MAJOR', 'INSPECTION'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all',
              filter === f
                ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                : 'border-metallic-700 text-slate-400 hover:border-metallic-600 bg-metallic-800/40'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Wrench size={40} className="mx-auto mb-4 opacity-30" />
            <p>No service sessions found.</p>
            <p className="text-sm mt-1">Sessions will appear here once customers book in.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
