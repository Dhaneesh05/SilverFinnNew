import { create } from 'zustand';

/**
 * Ordered inspection zones (0–7).
 * The mechanic MUST complete each zone sequentially before advancing.
 */
export const ZONE_SEQUENCE = [
  'engine',
  'front-left',
  'front-right',
  'rear-right',
  'rear-left',
  'undercarriage',
  'transmission',
  'interior',
  'electrical',
];

export const ZONE_LABELS = {
  'engine':        'Engine Bay',
  'front-left':    'Front Left',
  'front-right':   'Front Right',
  'rear-right':    'Rear Right',
  'rear-left':     'Rear Left',
  'undercarriage': 'Undercarriage',
  'transmission':  'Transmission',
  'interior':      'Interior',
  'electrical':    'Electrical',
  'overview':      'General Overview',
};

export const useStore = create((set, get) => ({
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
  activeZone: 'overview', // current zone key
  setActiveZone: (zone) => set({ activeZone: zone }),

  // Current step index within ZONE_SEQUENCE (0-based)
  currentStepIndex: 0,

  /**
   * Advance to the next zone in the sequence.
   * Returns false if already at the last zone.
   */
  advanceToNextZone: () => {
    const { currentStepIndex } = get();
    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= ZONE_SEQUENCE.length) return false;
    set({ currentStepIndex: nextIdx, activeZone: ZONE_SEQUENCE[nextIdx] });
    return true;
  },

  // Selected Vehicle (for Garage view before starting session)
  selectedVehicle: null,
  selectVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  // ── Service Session ────────────────────────────────────────────────
  currentSession: null,

  startSession: (vehicle, template) => set({
    currentSession: {
      vehicle,
      template,
      results: {},        // { templateItemId: { result, notes, partDetails? } }
      replacedParts: [],   // [{ itemId, partName, partNumber, brand, cost }]
    },
    currentStepIndex: 0,
    activeZone: ZONE_SEQUENCE[0], // Always start at first zone
  }),

  /**
   * Record a PASS / FAIL / NA result for a checklist item.
   * If result is 'FAIL' and partDetails is supplied, append to replacedParts.
   */
  recordResult: (itemId, result, notes = '', partDetails = null) => set((state) => {
    if (!state.currentSession) return {};

    const updatedResults = {
      ...state.currentSession.results,
      [itemId]: { result, notes },
    };

    // Handle part replacement tracking
    let updatedParts = [...state.currentSession.replacedParts];

    if (result === 'FAIL' && partDetails) {
      // Remove any existing part entry for this item first (user may re-submit)
      updatedParts = updatedParts.filter(p => p.itemId !== itemId);
      updatedParts.push({ itemId, ...partDetails });
    } else if (result !== 'FAIL') {
      // If changed away from FAIL, remove any associated part
      updatedParts = updatedParts.filter(p => p.itemId !== itemId);
    }

    return {
      currentSession: {
        ...state.currentSession,
        results: updatedResults,
        replacedParts: updatedParts,
      },
    };
  }),

  /**
   * Add or update a replaced part for a specific failed item.
   */
  addReplacedPart: (itemId, partDetails) => set((state) => {
    if (!state.currentSession) return {};
    let updatedParts = state.currentSession.replacedParts.filter(p => p.itemId !== itemId);
    updatedParts.push({ itemId, ...partDetails });
    return {
      currentSession: {
        ...state.currentSession,
        replacedParts: updatedParts,
      },
    };
  }),

  /**
   * Remove a replaced part entry for a specific item.
   */
  removeReplacedPart: (itemId) => set((state) => {
    if (!state.currentSession) return {};
    return {
      currentSession: {
        ...state.currentSession,
        replacedParts: state.currentSession.replacedParts.filter(p => p.itemId !== itemId),
      },
    };
  }),

  endSession: () => set({ currentSession: null, activeZone: 'overview', currentStepIndex: 0 }),
}));
