import React from 'react';
import { useStore } from '../../store';
import { Particles } from './Particles';
import { Cylinder, Text } from '@react-three/drei';
import { MATERIALS } from '../../constants';

export const WireScene = () => {
  const { length, area, material, voltage } = useStore();
  
  // Visual mapping: Area (mm2) -> Radius (world units)
  // Area = pi * r^2  => r = sqrt(Area/pi)
  const visualRadius = Math.sqrt(area / Math.PI) * 0.3;
  const visualLength = length * 5;

  const matInfo = MATERIALS[material];

  // Calculate opacity/transparency based on material type
  const isGlass = material === 'glass';

  return (
    <group>
      {/* The Wire Container */}
      <Cylinder 
        args={[visualRadius, visualRadius, visualLength, 32, 1, true]} 
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshPhysicalMaterial 
          color={matInfo.color} 
          transparent 
          opacity={isGlass ? 0.3 : 0.15} 
          metalness={isGlass ? 0 : 0.8}
          roughness={matInfo.roughness}
          side={2} // DoubleSide
        />
      </Cylinder>

      {/* Wire Cap Left */}
      <mesh position={[-visualLength/2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
         <ringGeometry args={[0, visualRadius, 32]} />
         <meshBasicMaterial color={matInfo.color} transparent opacity={0.3} side={2} />
      </mesh>
      
      {/* Wire Cap Right */}
      <mesh position={[visualLength/2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
         <ringGeometry args={[0, visualRadius, 32]} />
         <meshBasicMaterial color={matInfo.color} transparent opacity={0.3} side={2} />
      </mesh>

      {/* Electron Particles */}
      <Particles 
        count={Math.floor(500 * matInfo.electronDensity)} 
        mode="wire" 
        dimensions={{ length: visualLength, radius: visualRadius }} 
      />

      {/* Labels */}
      <group position={[0, visualRadius + 0.5, 0]}>
        <Text 
          color="white" 
          anchorX="center" 
          anchorY="middle" 
          fontSize={0.3}
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {voltage.toFixed(1)}V
        </Text>
      </group>
    </group>
  );
};
