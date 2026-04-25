import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Car, Calendar, Plus, User, FileText } from 'lucide-react';

export default function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const token = useStore(state => state.token);
  const setActiveView = useStore(state => state.setActiveView);
  const selectVehicle = useStore(state => state.selectVehicle);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        // Backend returns { data: [...], total, page, limit }
        setCustomers(Array.isArray(json) ? json : (json.data ?? []));
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = (vehicle) => {
    selectVehicle(vehicle);
    setActiveView('garage');
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.vehicles?.some(v => v.plateNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 bg-metallic-900 overflow-y-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-gold mb-2">Customers & Vehicles</h1>
          <p className="text-slate-400 text-sm">Manage your client database and initiate service sessions.</p>
        </div>
        
        <button className="bg-gold-500 hover:bg-gold-400 text-metallic-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-500" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or license plate..."
          className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-gold-500 transition-colors"
        />
      </div>

      {/* Customer Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="glass-panel p-6 border border-metallic-700/50 hover:border-gold-500/30 transition-colors group">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-metallic-800 rounded-full flex items-center justify-center border border-metallic-600">
                    <User size={20} className="text-gold-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-100">{customer.name}</h3>
                    <div className="text-xs text-slate-400 flex gap-3 mt-1">
                      <span>{customer.email || 'No email'}</span>
                      <span>•</span>
                      <span>{customer.phone || 'No phone'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicles */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registered Vehicles</h4>
                {customer.vehicles?.length > 0 ? (
                  customer.vehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-metallic-800/50 rounded-lg p-4 border border-metallic-700 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-metallic-900 rounded flex items-center justify-center">
                          <Car size={18} className="text-slate-300" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-200">{vehicle.plateNumber}</div>
                          <div className="text-xs text-slate-400">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="p-2 bg-metallic-900 border border-metallic-700 rounded text-slate-400 hover:text-gold-400 hover:border-gold-500 transition-colors"
                          title="Service History"
                        >
                          <FileText size={16} />
                        </button>
                        <button 
                          onClick={() => handleStartInspection(vehicle)}
                          className="px-4 py-2 bg-metallic-700 hover:bg-gold-500 hover:text-metallic-900 border border-metallic-600 rounded text-xs font-bold transition-colors"
                        >
                          START SESSION
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500 italic p-4 bg-metallic-800/30 rounded-lg border border-metallic-700/50 border-dashed">
                    No vehicles registered for this customer.
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              No customers found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
