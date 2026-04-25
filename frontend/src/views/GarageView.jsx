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
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('/garage_bg.png')" }}
      >
        <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 2, 5], fov: 45 }}>
          
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
              minPolarAngle={activeZone === 'overview' ? Math.PI / 2 : 0} 
              maxPolarAngle={activeZone === 'overview' ? Math.PI / 2 : Math.PI} 
              minDistance={activeZone === 'overview' ? 3 : 0.1} 
              maxDistance={10}
              enablePan={false}
              enableZoom={activeZone !== 'overview'}
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
