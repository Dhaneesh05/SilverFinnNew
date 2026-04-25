import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  Users,
  History,
  BarChart3,
  ChevronRight,
  Sparkles,
  LogOut,
  Zap,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import vehicleImg from '../assets/merc_c63s_clean.png';
import wireframeImg from '../assets/c63s_wireframe.png';

/* ──────────────────────────────────────────────────────────────────────
   Tile Configuration
   ────────────────────────────────────────────────────────────────────── */
const TILES = [
  {
    id: 'garage',
    area: 'checklist',
    label: 'GARAGE',
    sublabel: '3D VEHICLE INSPECTION',
    route: '/dashboard/garage',
    Icon: Wrench,
    gradient: 'from-fuchsia-600 via-purple-700 to-indigo-900',
    accentBg: 'bg-fuchsia-500/20',
    accentText: 'text-fuchsia-300',
    accentBorder: 'border-fuchsia-500/40',
    badge: { text: 'ACTIVE SESSION', color: 'bg-amber-400/20 text-amber-300 border-amber-400/40' },
    stats: [
      { value: '3D', label: 'Guided View' },
      { value: '24pt', label: 'Checklist' },
    ],
    tagline: 'Select a vehicle and walk through a guided 3D service inspection.',
    isPrimary: true,
  },
  {
    id: 'customers',
    area: 'knowledge',
    label: 'CUSTOMERS',
    sublabel: 'CLIENT MANAGEMENT',
    route: '/dashboard/customers',
    Icon: Users,
    gradient: 'from-cyan-500 via-teal-600 to-emerald-800',
    accentBg: 'bg-cyan-400/20',
    accentText: 'text-cyan-300',
    accentBorder: 'border-cyan-400/40',
    badge: { text: 'DATABASE', color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40' },
    stats: [
      { value: '128', label: 'Clients' },
      { value: 'CRM', label: 'Integrated' },
    ],
    tagline: null,
    isPrimary: false,
  },
  {
    id: 'analytics',
    area: 'analytics',
    label: 'ANALYTICS',
    sublabel: 'PREDICTIVE INSIGHTS',
    route: '/dashboard/analytics',
    Icon: BarChart3,
    gradient: 'from-emerald-500 via-green-600 to-teal-800',
    accentBg: 'bg-emerald-400/20',
    accentText: 'text-emerald-300',
    accentBorder: 'border-emerald-400/40',
    badge: null,
    stats: [{ value: '3', label: 'Alerts Active' }],
    tagline: null,
    isPrimary: false,
  },
  {
    id: 'history',
    area: 'history',
    label: 'HISTORY',
    sublabel: 'PAST SESSIONS & REPLACEMENTS',
    route: '/dashboard/history',
    Icon: History,
    gradient: 'from-blue-600 via-indigo-700 to-slate-900',
    accentBg: 'bg-blue-400/20',
    accentText: 'text-blue-300',
    accentBorder: 'border-blue-400/40',
    badge: null,
    stats: [
      { value: '47', label: 'Sessions' },
      { value: '12', label: 'Replaced' },
    ],
    tagline: null,
    isPrimary: false,
  },
];



/* ──────────────────────────────────────────────────────────────────────
   Animation Variants
   ────────────────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.92, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ──────────────────────────────────────────────────────────────────────
   <HubTile /> — Asphalt-style slanted tile
   ────────────────────────────────────────────────────────────────────── */
function HubTile({ tile, onSelect }) {
  return (
    <motion.button
      variants={tileVariants}
      onClick={() => onSelect(tile.route)}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.97 }}
      className={`
        group relative flex flex-col justify-between overflow-hidden
        rounded-[1.5rem] p-6 text-left cursor-pointer
        transition-shadow duration-300 min-h-[44px]
        border border-white/10
        hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] hover:border-white/20
      `}
      style={{ gridArea: tile.area }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-90`} />

      {/* Diagonal slash overlay for Asphalt energy */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent, transparent 40px,
            rgba(255,255,255,0.1) 40px,
            rgba(255,255,255,0.1) 42px
          )`,
        }}
      />

      {/* Glow accent on hover */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.06] transition-colors duration-300" />

      {/* Primary tile vehicle image */}
      {tile.isPrimary && (
        <img
          src={vehicleImg}
          alt="Service Vehicle"
          className="absolute inset-x-0 mx-auto bottom-24 w-[85%] max-w-[380px] object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)] opacity-90 pointer-events-none transition-all duration-700 group-hover:opacity-100 group-hover:scale-110 group-hover:-translate-y-2 z-10"
        />
      )}

      {/* Content */}
      <div className="relative z-20 flex-1 flex flex-col">
        {/* Icon + Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 ${tile.accentBg} rounded-2xl flex items-center justify-center border ${tile.accentBorder} backdrop-blur-sm`}>
            <tile.Icon size={20} strokeWidth={2} className={tile.accentText} />
          </div>
          {tile.badge && (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase border ${tile.badge.color} backdrop-blur-sm`}>
              {tile.badge.text}
            </span>
          )}
        </div>

        {/* Sub-label */}
        <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mb-1">
          {tile.sublabel}
        </span>

        {/* Title — slanted italic for high-energy Asphalt feel */}
        <h2 className={`font-extrabold italic tracking-tight text-white leading-tight drop-shadow-lg ${tile.isPrimary ? 'text-3xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
          {tile.label}
        </h2>

        {/* Tagline for primary tile */}
        {tile.tagline && (
          <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-[300px]">
            {tile.tagline}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="relative z-20 mt-4 flex flex-wrap gap-2">
        {tile.stats.map((s, i) => (
          <div key={i} className="px-3 py-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10">
            <span className="block text-sm font-bold text-white">{s.value}</span>
            <span className="block text-[10px] font-semibold tracking-wider text-white/50 uppercase">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Enter arrow */}
      <div className="relative z-20 mt-4 flex items-center gap-1 text-xs font-semibold text-white/40 group-hover:text-white/80 transition-colors min-h-[44px]">
        <span>ENTER</span>
        <ChevronRight size={14} className="translate-x-0 group-hover:translate-x-1.5 transition-transform duration-200" />
      </div>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   <HubView /> — Asphalt-9 Inspired Landing Page
   ────────────────────────────────────────────────────────────────────── */
export default function HubView() {
  const navigate = useNavigate();
  const logout = useStore(state => state.logout);
  const user = useStore(state => state.user);
  const [exiting, setExiting] = useState(false);

  const handleSelect = useCallback((route) => {
    setExiting(true);
    setTimeout(() => navigate(route), 400);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-metallic-900">

      {/* ─── Deep background layers ──────────────────────────────────── */}
      <div className="fixed inset-0 z-0" style={{
        background: 'radial-gradient(ellipse at 30% 20%, #1a1030 0%, #0f1114 40%, #0A0C0F 100%)',
      }} />

      {/* Wireframe schematic */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        <img src={wireframeImg} alt="" className="w-[75%] max-w-[850px] object-contain opacity-[0.03] mix-blend-screen select-none" />
      </div>

      {/* Diagonal slash accent (top-right) */}
      <div className="fixed top-0 right-0 w-1/2 h-full z-0 pointer-events-none opacity-[0.04]"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.15) 100%)',
        }}
      />



      {/* ─── Main Content ────────────────────────────────────────────── */}
      <AnimatePresence>
        {!exiting && (
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-12"
            initial="hidden" animate="show"
            exit={{ scale: 1.08, opacity: 0, filter: 'blur(16px)', transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
            variants={containerVariants}
          >
            {/* Hero Header */}
            <motion.div className="mb-10" variants={tileVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-lg border border-white/10 shadow-sm mb-4">
                <Sparkles size={14} className="text-gold-400" />
                <span className="text-[11px] font-bold tracking-[0.15em] text-slate-400 uppercase">
                  Silver Finn AI
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black italic tracking-tight text-white font-display">
                THE HUB
              </h1>
              <p className="mt-2 text-sm text-slate-500 font-medium">
                Intelligent Workshop Management — Select a workspace
              </p>
            </motion.div>

            {/* Asymmetric Tile Grid — Asphalt Layout */}
            <div className="grid gap-4" style={{
              gridTemplateColumns: '2fr 1fr 1fr',
              gridTemplateRows: 'auto auto',
              gridTemplateAreas: `
                "checklist knowledge knowledge"
                "checklist analytics history"
              `,
            }}>
              {TILES.map((tile) => (
                <HubTile key={tile.id} tile={tile} onSelect={handleSelect} />
              ))}
            </div>

            {/* Bottom quick stats strip */}
            <motion.div variants={tileVariants} className="mt-6 flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">System Online</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Zap size={12} className="text-gold-400" />
                  <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">5 Vehicles in Garage</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 tracking-widest uppercase">Build v1.0.4-rc</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
