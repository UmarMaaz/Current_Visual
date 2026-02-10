import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStore } from '../store';
import { LESSONS } from '../constants';
import { WireScene } from './Simulations/WireScene';
import { ResistorScene } from './Simulations/ResistorScene';
import { CircuitScene } from './Simulations/CircuitScene';

export const Scene = () => {
  const { currentLessonId } = useStore();
  const currentLesson = LESSONS.find(l => l.id === currentLessonId);

  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }} gl={{ antialias: true }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -5, -10]} intensity={0.5} color="blue" />
        <spotLight position={[0, 10, 0]} intensity={0.8} angle={0.5} penumbra={1} />

        {/* Scene Content Switcher */}
        {currentLesson?.sceneMode === 'block' ? (
          <ResistorScene />
        ) : currentLesson?.sceneMode === 'circuit' ? (
          <CircuitScene />
        ) : (
          <WireScene />
        )}

        {/* Environment & Effects */}
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          fadeStrength={5} 
          sectionColor="#4f46e5" 
          cellColor="#1e293b" 
          position={[0, -4, 0]}
        />
        
        <OrbitControls makeDefault minDistance={2} maxDistance={25} />
        
        <EffectComposer disableNormalPass>
           <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.0} radius={0.4} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
