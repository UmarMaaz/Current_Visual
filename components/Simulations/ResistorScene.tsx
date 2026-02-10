import React from 'react';
import { useStore } from '../../store';
import { Particles } from './Particles';
import { Box, Text } from '@react-three/drei';
import { MATERIALS } from '../../constants';
import { useFrame } from '@react-three/fiber';

export const ResistorScene = () => {
  const { length, area, material, temperature, voltage, setTemperature, currentLessonId, isPlaying } = useStore();
  
  // Visual mapping
  // Length slider 1-5 -> World Length 2-10
  const visualLength = length * 3;
  // Area slider 1-10 -> Thickness
  const thickness = Math.sqrt(area) * 0.4;
  
  const matInfo = MATERIALS[material];

  // Physics Loop for Heat Simulation
  useFrame((state, delta) => {
    // Only run active physics in the "Power & Heat" lesson
    if (currentLessonId === 'power' && isPlaying) {
       const mat = MATERIALS[material];
       const R_material = (mat.resistivity * length) / (area * 1e-6);
       
       // Simulate a real power source with Internal Resistance
       // This prevents infinite current when R_material is near zero (like a copper wire)
       // and allows "Thin wire = Hotter" behavior (Max Power Transfer principle approaching R_int)
       const R_internal = 0.5; 
       
       const totalCurrent = voltage / (R_material + R_internal);
       
       // Power dissipated ONLY in the material block (P = I^2 * R)
       const PowerDissipated = totalCurrent * totalCurrent * R_material;
       
       // Thermodynamics Simulation
       const Tamb = 300; // Ambient temp (K)
       
       // Heat Capacity: Amount of energy needed to raise temp. Scales with mass (Volume).
       // Adjusted constant to be responsive for UI
       const heatCapacity = 50 * length * (area / 2); 
       
       // Cooling: Energy lost to environment. Scales with Surface Area.
       // Newton's Law of Cooling
       const coolingCoeff = 3.0 * length; 
       
       // Energy In scaling: Tuning parameter to make 12V on thin copper glow red
       const energyIn = PowerDissipated * delta * 800; 
       const energyOut = coolingCoeff * (temperature - Tamb) * delta;
       
       const netEnergy = energyIn - energyOut;
       
       let newTemp = temperature + (netEnergy / heatCapacity);
       
       // Clamping for stability
       if (newTemp < 300) newTemp = 300;
       if (newTemp > 4000) newTemp = 4000; 
       
       // Update store
       setTemperature(newTemp);
    }
  });

  // Heat Glow Calculation
  const normalizedTemp = Math.min((temperature - 300) / 1000, 1);
  const glowIntensity = normalizedTemp * 3;

  return (
    <group>
      {/* The Resistor Block */}
      <Box args={[visualLength, thickness, thickness]}>
         <meshPhysicalMaterial 
            color={matInfo.color}
            emissive="#ff3300"
            emissiveIntensity={glowIntensity}
            transparent
            opacity={0.3 + (normalizedTemp * 0.4)}
            roughness={0.2}
            metalness={0.1}
         />
      </Box>
      
      {/* Heat Haze / Smoke (Simple visual cue if very hot) */}
      {temperature > 800 && (
        <group position={[0, thickness, 0]}>
           <Text position={[0, 0.5, 0]} fontSize={0.5} color="orange" anchorY="bottom">
             ⚠️ HIGH TEMP
           </Text>
        </group>
      )}

      {/* Internal Atomic Lattice (Visual representation of resistance sources) */}
      <Particles 
        count={200} 
        mode="block" 
        dimensions={{ length: visualLength, radius: thickness/2 }} 
      />

      {/* Dimensions Labels */}
      <Text 
        position={[0, thickness/2 + 0.4, 0]} 
        fontSize={0.25} 
        color="white"
        outlineWidth={0.01}
        outlineColor="black"
      >
        L = {length.toFixed(1)}m
      </Text>
      <Text 
        position={[visualLength/2 + 0.4, 0, 0]} 
        fontSize={0.25} 
        color="white"
        outlineWidth={0.01}
        outlineColor="black"
        rotation={[0, 0, -Math.PI/2]}
      >
        A = {area.toFixed(1)}mm²
      </Text>
    </group>
  );
};
