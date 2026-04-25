import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Car Images ──────────────────────────────────────────────────── */
import amgPic5 from '../assets/amgc63pic5.jpg';
import amgPic6 from '../assets/amgc63pic6.jpg';

const IMAGES = [amgPic5, amgPic6];

/* ── Fun Facts ───────────────────────────────────────────────────── */
const FACTS = [
  {
    title: 'Engine',
    value: '4.0L V8 Biturbo',
    detail: 'Hand-built by a single AMG craftsman under the "One Man, One Engine" philosophy.',
  },
  {
    title: 'Power',
    value: '503 HP / 516 lb-ft',
    detail: 'Peak torque arrives at just 1,750 RPM and holds flat through 4,500 RPM.',
  },
  {
    title: 'Transmission',
    value: '9-Speed AMG SPEEDSHIFT MCT',
    detail: 'Multi-clutch wet start-off replaces the torque converter for faster shifts.',
  },
  {
    title: '0 – 60 mph',
    value: '3.8 seconds',
    detail: 'AMG DYNAMICS selects between Basic, Advanced, Pro, and Master handling modes.',
  },
  {
    title: 'Top Speed',
    value: '180 mph (limited)',
    detail: 'The optional AMG Driver\'s Package raises the electronically governed top speed to 180 mph.',
  },
  {
    title: 'Exhaust',
    value: 'AMG Performance Exhaust',
    detail: 'Electronically controlled flaps with three modes — Quiet, Balanced, and Powerful.',
  },
  {
    title: 'Brakes',
    value: '390 mm Front / 360 mm Rear',
    detail: 'Composite brake discs with 6-piston front & single-piston rear calipers.',
  },
  {
    title: 'Suspension',
    value: 'AMG RIDE CONTROL',
    detail: 'Electronically adjustable damping with Comfort, Sport, and Sport+ settings.',
  },
  {
    title: 'Curb Weight',
    value: '3,880 lbs (1,760 kg)',
    detail: 'Aluminium hood, trunk lid, and front fenders reduce weight over steel equivalents.',
  },
  {
    title: 'Lifespan',
    value: '200,000+ miles',
    detail: 'The M177 engine is known for exceptional durability with proper maintenance intervals.',
  },
];

/* ── Spec bar items ──────────────────────────────────────────────── */
const QUICK_SPECS = [
  { label: 'ENGINE', value: 'V8 BITURBO' },
  { label: 'POWER', value: '503 HP' },
  { label: 'TORQUE', value: '516 LB-FT' },
  { label: '0-60', value: '3.8 S' },
  { label: 'DRIVETRAIN', value: 'RWD' },
];

/* ── Component ───────────────────────────────────────────────────── */
export default function LoadingScreen({ duration = 5000, onFinished }) {
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);

  // Pick random facts to display (non-repeating)
  const displayFacts = useMemo(() => {
    const shuffled = [...FACTS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  // Progress bar animation
  useEffect(() => {
    const interval = 50;
    const increment = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);
    return () => clearInterval(timer);
  }, [duration]);

  // Cycle through facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % displayFacts.length);
    }, Math.floor(duration / displayFacts.length));
    return () => clearInterval(factInterval);
  }, [duration, displayFacts.length]);

  // Cycle through images
  useEffect(() => {
    const imageInterval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % IMAGES.length);
    }, Math.floor(duration / IMAGES.length));
    return () => clearInterval(imageInterval);
  }, [duration]);

  // Fire onFinished after duration
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (onFinished) onFinished();
    }, duration + 600); // Extra 600ms for exit animation
    return () => clearTimeout(timeout);
  }, [duration, onFinished]);

  const currentFact = displayFacts[factIndex];

  return (
    <AnimatePresence>
      {progress < 100 ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Background Image ─────────────────────────────────────── */}
          <div className="absolute inset-0 bg-black">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={imageIndex}
                src={IMAGES[imageIndex]}
                alt="Mercedes-AMG C63 S"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </div>

          {/* ── Gradient overlays ────────────────────────────────────── */}
          {/* Bottom gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          {/* Top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />
          {/* Side vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />

          {/* ── Diagonal racing lines (Forza aesthetic) ──────────────── */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent, transparent 80px,
                rgba(255,255,255,0.08) 80px,
                rgba(255,255,255,0.08) 82px
              )`,
            }}
          />

          {/* ── Top Left — Car Model Badge ────────────────────────────── */}
          <motion.div
            className="absolute top-8 left-8 z-20"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <span className="text-white font-black text-sm italic">AMG</span>
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.25em] text-white/40 uppercase">
                  Mercedes-AMG
                </p>
                <h2 className="text-lg font-black italic text-white tracking-tight leading-none">
                  C 63 S COUPÉ
                </h2>
              </div>
            </div>
          </motion.div>

          {/* ── Top Right — Silver Finn Branding ──────────────────────── */}
          <motion.div
            className="absolute top-8 right-8 z-20"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-[9px] font-black text-black">SF</span>
              </div>
              <span className="text-[11px] font-bold tracking-[0.15em] text-white/60 uppercase">
                Silver Finn AI
              </span>
            </div>
          </motion.div>

          {/* ── Content Area (bottom) ─────────────────────────────────── */}
          <div className="relative z-20 mt-auto px-8 pb-8">

            {/* Fact Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={factIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mb-8 max-w-lg"
              >
                <p className="text-[10px] font-bold tracking-[0.25em] text-amber-400/80 uppercase mb-1">
                  {currentFact.title}
                </p>
                <h3 className="text-3xl md:text-4xl font-black italic text-white tracking-tight leading-tight mb-2">
                  {currentFact.value}
                </h3>
                <p className="text-sm text-white/50 leading-relaxed max-w-md">
                  {currentFact.detail}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Quick Specs Bar */}
            <motion.div
              className="flex flex-wrap gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {QUICK_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10"
                >
                  <span className="block text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                    {spec.label}
                  </span>
                  <span className="block text-sm font-bold text-white mt-0.5">
                    {spec.value}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
                  Loading Workshop
                </span>
                <span className="text-[10px] font-mono font-bold text-white/40">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #f59e0b, #d97706, #b45309)',
                  }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
