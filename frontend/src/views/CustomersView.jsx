import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Car, Calendar, Plus, User, FileText, X } from 'lucide-react';

export default function CustomersView() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', plateNumber: '', make: '', model: '', year: '', glbModelKey: '' });
  
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

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        vehicle: newCustomer.make ? {
          make: newCustomer.make,
          model: newCustomer.model,
          year: newCustomer.year,
          plateNumber: newCustomer.plateNumber,
          glbModelKey: newCustomer.glbModelKey || undefined
        } : null
      };

      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setNewCustomer({ name: '', email: '', phone: '', plateNumber: '', make: '', model: '', year: '', glbModelKey: '' });
        fetchCustomers();
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  const handleStartInspection = (vehicle) => {
    selectVehicle(vehicle);
    setActiveView('garage');
  };

  const handleViewHistory = (vehicle) => {
    selectVehicle(vehicle);
    setActiveView('history');
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
        
        <button onClick={() => setIsModalOpen(true)} className="bg-gold-500 hover:bg-gold-400 text-metallic-900 font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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
                          <div className="text-xs text-gold-400 mt-0.5">{(vehicle.currentMileage ?? 0).toLocaleString()} km</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewHistory(vehicle)}
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

      {/* New Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-metallic-900 border border-metallic-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-metallic-700/50">
              <h2 className="text-xl font-display font-bold text-slate-100">Add New Customer</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 border-b border-metallic-700/50 pb-2">Customer Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Full Name *</label>
                    <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="John Doe" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Phone Number *</label>
                    <input required type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="+60 12-345 6789" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-slate-400">Email Address</label>
                    <input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="john@example.com" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gold-400 uppercase tracking-wider mb-4 border-b border-metallic-700/50 pb-2">Vehicle Details (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Make</label>
                    <input type="text" value={newCustomer.make} onChange={e => setNewCustomer({...newCustomer, make: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="Honda" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Model</label>
                    <input type="text" value={newCustomer.model} onChange={e => setNewCustomer({...newCustomer, model: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="Civic" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Year</label>
                    <input type="number" value={newCustomer.year} onChange={e => setNewCustomer({...newCustomer, year: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="2022" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Plate Number</label>
                    <input type="text" value={newCustomer.plateNumber} onChange={e => setNewCustomer({...newCustomer, plateNumber: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="VBA 1234" />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-slate-400">3D Model File Key (e.g. 'honda_civic')</label>
                    <input type="text" value={newCustomer.glbModelKey} onChange={e => setNewCustomer({...newCustomer, glbModelKey: e.target.value})} className="w-full bg-metallic-800 border border-metallic-700 text-slate-200 text-sm rounded px-3 py-2 focus:outline-none focus:border-gold-500" placeholder="Without .glb extension" />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-metallic-700/50 flex justify-end gap-3 mt-auto">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-gold-500 hover:bg-gold-400 text-metallic-900 text-sm font-bold rounded shadow-lg shadow-gold-500/20 transition-all">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
