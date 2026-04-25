import { create } from 'zustand';

export const useStore = create((set) => ({
  // Authentication
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, activeView: 'garage' });
  },

  // Navigation
  activeView: 'garage', // 'garage' | 'customers' | 'history' | 'settings'
  setActiveView: (view) => set({ activeView: view }),

  // 3D Garage UI
  activeZone: 'overview', // 'overview' | 'engine' | 'front-left' | 'front-right' | 'rear-left' | 'rear-right' | 'undercarriage'
  setActiveZone: (zone) => set({ activeZone: zone }),

  // Selected Vehicle (for Garage view before starting session)
  selectedVehicle: null,
  selectVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  // Service Session
  currentSession: null,
  startSession: (vehicle, template) => set({ 
    currentSession: {
      vehicle,
      template,
      results: {}, // { templateItemId: { result: 'PASS', notes: '' } }
    },
    activeZone: 'engine' // Auto-start at first zone
  }),
  
  recordResult: (itemId, result, notes = '') => set((state) => ({
    currentSession: state.currentSession ? {
      ...state.currentSession,
      results: {
        ...state.currentSession.results,
        [itemId]: { result, notes }
      }
    } : null
  })),

  endSession: () => set({ currentSession: null, activeZone: 'overview' })
}));
