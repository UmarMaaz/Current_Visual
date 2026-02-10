import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { MATERIALS } from '../../constants';

interface ParticlesProps {
  count: number;
  mode: 'wire' | 'block';
  dimensions: { length: number; radius: number };
}

export const Particles: React.FC<ParticlesProps> = ({ count, mode, dimensions }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { voltage, material, length, area, temperature } = useStore();

  // Create random initial positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const angle = Math.random() * Math.PI * 2;
      // Distribute within cylinder or box
      const r = Math.sqrt(Math.random()) * dimensions.radius;
      const x = (Math.random() - 0.5) * dimensions.length;
      const y = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      temp.push({ x, y, z, speedOffset: Math.random() * 0.5 + 0.5 });
    }
    return temp;
  }, [count, dimensions]);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Physics Calculations
    const matProps = MATERIALS[material];
    
    // Calculate Drift Velocity (Simplified Model)
    // v_d = (I) / (nAe).  I = V/R.  R ~ rho*L/A
    // Therefore v_d ~ V / (rho * L)
    // We add a clamp to prevent infinite speed at 0 resistance logic
    
    const resistivity = matProps.resistivity; 
    // Effectively scaling speed for visualization
    // If voltage is 0, drift is 0.
    const driftSpeed = (voltage * 2) / (Math.max(resistivity * 1e8, 0.1) * length);
    
    // Thermal velocity (Brownian motion)
    // Scales with temperature
    const thermalJitter = (temperature / 300) * 0.05 * (matProps.name.includes('Insulator') ? 0.1 : 1);

    // Color based on speed/energy
    const color = new THREE.Color();
    const baseColor = new THREE.Color('#00f3ff'); // Electron Blue
    const hotColor = new THREE.Color('#ff2a00'); // Heat Red

    particles.forEach((particle, i) => {
      // 1. Update Position
      // Drift component (X axis)
      particle.x += driftSpeed * delta * particle.speedOffset;

      // Thermal component (Random jitter)
      particle.x += (Math.random() - 0.5) * thermalJitter;
      particle.y += (Math.random() - 0.5) * thermalJitter;
      particle.z += (Math.random() - 0.5) * thermalJitter;

      // 2. Boundary Checks (Wrap around)
      const halfLen = dimensions.length / 2;
      if (particle.x > halfLen) particle.x = -halfLen;
      if (particle.x < -halfLen) particle.x = halfLen;

      // Radial constraint (keep inside wire)
      const distSq = particle.y*particle.y + particle.z*particle.z;
      if (distSq > dimensions.radius * dimensions.radius) {
         // Push back in
         particle.y *= 0.9;
         particle.z *= 0.9;
      }

      // 3. Update Matrix
      dummy.position.set(particle.x, particle.y, particle.z);
      
      // Scale particles slightly based on density
      const scale = 0.05 * (mode === 'block' ? 2 : 1);
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // 4. Update Color (Heat visualization)
      // High drift + High resistance (collisions) = Heat
      // Or just high random movement
      const heatFactor = Math.min((Math.abs(driftSpeed) * resistivity * 1e7) + (temperature - 300)/500, 1);
      color.lerpColors(baseColor, hotColor, heatFactor);
      meshRef.current!.setColorAt(i, color);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
};
