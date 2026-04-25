import React, { useRef, useEffect, useMemo } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore, ZONE_SEQUENCE } from '../../store/useStore';
import clsx from 'clsx';

// Camera positions and look targets for each inspection zone
const ZONE_CAMERAS = {
  'overview':      { pos: new THREE.Vector3(5, 3, 5),      target: new THREE.Vector3(0, 0.5, 0)   },
  'engine':        { pos: new THREE.Vector3(0, 2.5, 3.5),  target: new THREE.Vector3(0, 1, 1.5)   },
  'front-left':    { pos: new THREE.Vector3(-3, 1.5, 2),   target: new THREE.Vector3(-1, 0.5, 1)  },
  'front-right':   { pos: new THREE.Vector3(3, 1.5, 2),    target: new THREE.Vector3(1, 0.5, 1)   },
  'rear-left':     { pos: new THREE.Vector3(-3, 1.5, -2),  target: new THREE.Vector3(-1, 0.5, -1) },
  'rear-right':    { pos: new THREE.Vector3(3, 1.5, -2),   target: new THREE.Vector3(1, 0.5, -1)  },
  'undercarriage': { pos: new THREE.Vector3(4, 0.1, 0),    target: new THREE.Vector3(0, 0, 0)     },
  'transmission':  { pos: new THREE.Vector3(-4, 0.1, 0),   target: new THREE.Vector3(0, 0, 0)     },
  'interior':      { pos: new THREE.Vector3(0, 2.5, 0.5),  target: new THREE.Vector3(0, 1, 0)     },
  'electrical':    { pos: new THREE.Vector3(-2, 2, 2.5),   target: new THREE.Vector3(0, 0.8, 1)   },
};

// 3D positions for each zone hotspot
const ZONE_HOTSPOTS = [
  { position: [0, 1.2, 1.5],     zone: 'engine',        label: 'ENG' },
  { position: [-1.2, 0.5, 1.2],  zone: 'front-left',    label: 'FL'  },
  { position: [1.2, 0.5, 1.2],   zone: 'front-right',   label: 'FR'  },
  { position: [1.2, 0.5, -1.2],  zone: 'rear-right',    label: 'RR'  },
  { position: [-1.2, 0.5, -1.2], zone: 'rear-left',     label: 'RL'  },
  { position: [0, 0.1, 0],       zone: 'undercarriage', label: 'UC'  },
  { position: [0, 0.2, 0.5],     zone: 'transmission',  label: 'TRN' },
  { position: [0, 1.4, 0],       zone: 'interior',      label: 'INT' },
  { position: [-0.8, 1.0, 1.8],  zone: 'electrical',    label: 'ELC' },
];

// Target size: fit the car into a ~4-unit bounding box
const TARGET_SIZE = 4;

export default function CarModel(props) {
  const currentSession = useStore(state => state.currentSession);
  const selectedVehicle = useStore(state => state.selectedVehicle);
  const activeVehicle = currentSession?.vehicle || selectedVehicle;
  
  const modelUrl = activeVehicle?.glbModelKey 
    ? `/${activeVehicle.glbModelKey}.glb` 
    : '/2019_mercedes-benz_c63_s_amg_coupe.glb';
    
  const { scene } = useGLTF(modelUrl);
  const activeZone = useStore(state => state.activeZone);
  const setActiveZone = useStore(state => state.setActiveZone);
  const currentStepIndex = useStore(state => state.currentStepIndex);
  const groupRef = useRef();

  // Auto-normalize scale using Box3 so any GLB unit scale works
  useEffect(() => {
    if (!scene || !groupRef.current) return;

    // Reset transforms before measuring
    scene.position.set(0, 0, 0);
    scene.rotation.set(0, 0, 0);
    scene.scale.set(1, 1, 1);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;

    const scaleFactor = TARGET_SIZE / maxDim;
    scene.scale.setScalar(scaleFactor);

    // Recompute box after scaling and shift so bottom sits at y=0
    const scaledBox = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    scaledBox.getCenter(center);
    const scaledMin = scaledBox.min;

    scene.position.set(-center.x, -scaledMin.y, -center.z);
  }, [scene, modelUrl]); // re-run if modelUrl changes

  const targetZoneRef = useRef(activeZone);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (targetZoneRef.current !== activeZone) {
      targetZoneRef.current = activeZone;
      isAnimatingRef.current = true;
    }
  }, [activeZone]);

  useFrame((state, delta) => {
    if (!isAnimatingRef.current) return;

    const config = ZONE_CAMERAS[activeZone] || ZONE_CAMERAS['overview'];
    state.camera.position.lerp(config.pos, 4 * delta);
    
    if (state.controls) {
      state.controls.target.lerp(config.target, 4 * delta);
      state.controls.update();

      const distPos = state.camera.position.distanceTo(config.pos);
      const distTarget = state.controls.target.distanceTo(config.target);
      
      // Stop animating once we are close enough
      if (distPos < 0.05 && distTarget < 0.05) {
        isAnimatingRef.current = false;
      }
    }
  });

  /**
   * Determine hotspot status for coloring:
   * - 'active'    → Amber-400 pulsing (current zone)
   * - 'passed'    → Green (completed, all pass)
   * - 'failed'    → Red (completed, at least one fail)
   * - 'completed' → Green (completed, mixed but no specific fail info per zone)
   * - 'locked'    → Grey (future, not yet reachable)
   */
  const getZoneStatus = (zone) => {
    if (!currentSession) return 'locked';

    const zoneIdx = ZONE_SEQUENCE.indexOf(zone);
    if (zoneIdx < 0) return 'locked';

    // Current active zone
    if (zoneIdx === currentStepIndex) return 'active';

    // Future zone
    if (zoneIdx > currentStepIndex) return 'locked';

    // Past zone — check results
    const zoneItems = currentSession.template?.items?.filter(i => i.zone === zone) || [];
    if (zoneItems.length === 0) return 'completed';

    const hasAnyFail = zoneItems.some(item => currentSession.results[item.id]?.result === 'FAIL');
    return hasAnyFail ? 'failed' : 'passed';
  };

  const Hotspot = ({ position, zone, label }) => {
    const status = getZoneStatus(zone);
    const isActive = status === 'active';
    const isLocked = status === 'locked';

    const handleClick = () => {
      if (isLocked || !currentSession) return;
      // Allow clicking back to completed zones (read-only review) or current zone
      setActiveZone(zone);
    };

    // Tailwind classes based on status
    const dotClasses = clsx(
      "cursor-pointer transition-all duration-300 transform rounded-full border-2 flex items-center justify-center font-display font-bold text-xs tracking-wider",
      {
        // Active — pulsing amber
        "w-10 h-10 bg-amber-400/20 border-amber-400 text-amber-400 scale-125 shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-pulse":
          status === 'active',
        // Passed — solid green
        "w-8 h-8 bg-emerald-500/20 border-emerald-500 text-emerald-400":
          status === 'passed',
        // Failed — solid red
        "w-8 h-8 bg-red-500/20 border-red-500 text-red-400":
          status === 'failed',
        // Completed generic
        "w-8 h-8 bg-emerald-500/20 border-emerald-500 text-emerald-400":
          status === 'completed',
        // Locked — grey, no hover
        "w-7 h-7 bg-metallic-900/60 border-metallic-700 text-metallic-600 cursor-not-allowed opacity-50":
          status === 'locked',
      }
    );

    return (
      <Html position={position} center zIndexRange={[100, 0]}>
        <div onClick={handleClick} className={dotClasses} title={label}>
          {label}
        </div>
      </Html>
    );
  };

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <primitive object={scene} />

      {/* Interactive Hotspots — all 8 inspection zones */}
      {ZONE_HOTSPOTS.map(h => (
        <Hotspot key={h.zone} position={h.position} zone={h.zone} label={h.label} />
      ))}
    </group>
  );
}
