import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useStore } from '../store/useStore';
import CarModel from '../components/three/CarModel';
import ChecklistOverlay from '../components/ui/ChecklistOverlay';
import VehicleInfoOverlay from '../components/ui/VehicleInfoOverlay';
import AIChatBot from '../components/ui/AIChatBot';

export default function GarageView() {
  const activeZone = useStore(state => state.activeZone);

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas Background Layer */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-metallic-900 to-black">
        <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 2, 5], fov: 45 }}>
          <color attach="background" args={['#0A0C0F']} />
          <fog attach="fog" args={['#0A0C0F', 20, 100]} />
          
          <Suspense fallback={null}>
            <Environment preset="studio" environmentIntensity={1.5} />
            
            {/* Custom Studio Lighting */}
            <ambientLight intensity={1.5} />
            <spotLight position={[0, 10, 0]} intensity={3.5} penumbra={1} angle={0.8} castShadow />
            <spotLight position={[-5, 5, -5]} intensity={4} color="#D4AF37" distance={30} /> {/* Gold accent rim light */}
            <spotLight position={[5, 2, 5]} intensity={2} color="#ffffff" distance={20} />

            <CarModel />
            
            <ContactShadows position={[0, -0.01, 0]} opacity={0.7} scale={10} blur={2.5} far={4} color="#000000" />
            
            <OrbitControls 
              makeDefault 
              minPolarAngle={Math.PI / 4} 
              maxPolarAngle={Math.PI / 2.1} 
              minDistance={3} 
              maxDistance={10}
              enablePan={false}
              autoRotate={activeZone === 'overview'}
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* 2D UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none p-6">
        <div className="flex w-full h-full gap-6">
          {/* Left Column: Vehicle Info / Action Space */}
          <div className="w-80 pointer-events-auto flex flex-col gap-4">
            <VehicleInfoOverlay />
          </div>

          {/* Spacer for 3D Car visibility */}
          <div className="flex-1" />

          {/* Right Column: Dynamic Checklist UI */}
          <div className="w-[400px] pointer-events-auto flex flex-col h-full">
            <ChecklistOverlay />
          </div>
        </div>
      </div>
      
      {/* RAG Chat Bot Component */}
      <AIChatBot />
    </div>
  );
}
