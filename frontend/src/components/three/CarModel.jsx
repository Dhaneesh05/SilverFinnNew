import React, { useRef, useEffect } from 'react';
import { useGLTF, Html, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

// Camera positions and look targets for each inspection zone
const ZONE_CAMERAS = {
  'overview': { pos: new THREE.Vector3(5, 3, 5), target: new THREE.Vector3(0, 0.5, 0) },
  'engine': { pos: new THREE.Vector3(0, 2.5, 3.5), target: new THREE.Vector3(0, 1, 1.5) },
  'front-left': { pos: new THREE.Vector3(-3, 1.5, 2), target: new THREE.Vector3(-1, 0.5, 1) },
  'front-right': { pos: new THREE.Vector3(3, 1.5, 2), target: new THREE.Vector3(1, 0.5, 1) },
  'rear-left': { pos: new THREE.Vector3(-3, 1.5, -2), target: new THREE.Vector3(-1, 0.5, -1) },
  'rear-right': { pos: new THREE.Vector3(3, 1.5, -2), target: new THREE.Vector3(1, 0.5, -1) },
  'undercarriage': { pos: new THREE.Vector3(4, 0.1, 0), target: new THREE.Vector3(0, 0, 0) },
};

export default function CarModel(props) {
  const { scene } = useGLTF('/2019_mercedes-benz_c63_s_amg_coupe.glb'); 
  const activeZone = useStore(state => state.activeZone);
  const setActiveZone = useStore(state => state.setActiveZone);
  const modelRef = useRef();

  useFrame((state, delta) => {
    const config = ZONE_CAMERAS[activeZone] || ZONE_CAMERAS['overview'];
    state.camera.position.lerp(config.pos, 3 * delta);
    if (state.controls) {
      state.controls.target.lerp(config.target, 3 * delta);
      state.controls.update();
    }
  });

  const Hotspot = ({ position, zone, label }) => {
    const isActive = activeZone === zone;
    return (
      <Html position={position} center zIndexRange={[100, 0]}>
        <div 
          onClick={() => setActiveZone(zone)}
          className={clsx(
            "cursor-pointer transition-all duration-300 transform rounded-full border-2 flex items-center justify-center font-display font-bold text-xs tracking-wider",
            isActive 
              ? "w-10 h-10 bg-gold-500/20 border-gold-500 text-gold-400 scale-125 shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
              : "w-8 h-8 bg-metallic-900/50 border-metallic-600 text-slate-300 hover:border-gold-400 hover:text-gold-400 hover:scale-110"
          )}
        >
          {label}
        </div>
      </Html>
    );
  };

  return (
    <group ref={modelRef} {...props} dispose={null}>
      <Center position={[0, -0.5, 0]}>
        {scene && <primitive object={scene} scale={0.001} />}
      </Center>
      
      {/* Interactive Hotspots matching our database zones */}
      <Hotspot position={[0, 1, 1.5]} zone="engine" label="ENG" />
      <Hotspot position={[-1, 0.4, 1.2]} zone="front-left" label="FL" />
      <Hotspot position={[1, 0.4, 1.2]} zone="front-right" label="FR" />
      <Hotspot position={[-1, 0.4, -1.2]} zone="rear-left" label="RL" />
      <Hotspot position={[1, 0.4, -1.2]} zone="rear-right" label="RR" />
    </group>
  );
}

useGLTF.preload('/2019_mercedes-benz_c63_s_amg_coupe.glb');
