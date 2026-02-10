import React, { useMemo, useRef } from 'react';
import { useStore } from '../../store';
import { Box, Cylinder, Text, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// --- Sub-components for circuit parts ---

const Battery = ({ voltage }: { voltage: number }) => (
  <group rotation={[0, 0, Math.PI / 2]}>
    <Cylinder args={[0.8, 0.8, 2.5, 32]}>
      <meshStandardMaterial color="#333" metalness={0.6} roughness={0.4} />
    </Cylinder>
    {/* Positive Terminal */}
    <Cylinder position={[0, 1.4, 0]} args={[0.3, 0.3, 0.3, 32]}>
      <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
    </Cylinder>
    {/* Label */}
    <group rotation={[0, 0, -Math.PI / 2]} position={[0, 0, 1]}>
      <Text fontSize={0.8} color="white" position={[-0.5, 0, 0]}>+</Text>
      <Text fontSize={0.4} color="#ffd700" position={[0, -0.8, 0]}>{voltage.toFixed(1)}V</Text>
    </group>
  </group>
);

const Resistor = ({ resistance }: { resistance: number }) => {
  // Simple band color logic based on value (mock)
  const band1 = resistance < 10 ? 'black' : resistance < 50 ? 'brown' : 'red';
  
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* Body */}
      <Cylinder args={[0.5, 0.5, 2, 32]}>
        <meshStandardMaterial color="#f5e6ca" />
      </Cylinder>
      {/* Bands */}
      <Cylinder position={[0, 0.5, 0]} args={[0.52, 0.52, 0.2, 32]}>
        <meshBasicMaterial color={band1} />
      </Cylinder>
      <Cylinder position={[0, 0, 0]} args={[0.52, 0.52, 0.2, 32]}>
        <meshBasicMaterial color="gold" />
      </Cylinder>
      <Cylinder position={[0, -0.5, 0]} args={[0.52, 0.52, 0.2, 32]}>
        <meshBasicMaterial color="red" />
      </Cylinder>
      
      {/* Label */}
      <Text position={[0, -1.5, 0]} rotation={[0, 0, -Math.PI/2]} fontSize={0.4} color="white">
        {resistance.toFixed(0)} Ω
      </Text>
    </group>
  );
};

const Meter = ({ value, unit, label, color = "#222" }: { value: number, unit: string, label: string, color?: string }) => (
  <group>
    <Box args={[1.5, 1, 0.5]}>
      <meshStandardMaterial color={color} />
    </Box>
    <Box args={[1.3, 0.6, 0.1]} position={[0, 0.1, 0.26]}>
      <meshBasicMaterial color="#1a2e1a" />
    </Box>
    <Text position={[0, 0.1, 0.27]} fontSize={0.3} color="#00ff00" font="monospace">
      {value.toFixed(2)} {unit}
    </Text>
    <Text position={[0, -0.3, 0.26]} fontSize={0.15} color="#aaa">
      {label}
    </Text>
  </group>
);

const CircuitParticles = ({ current, pathPoints }: { current: number, pathPoints: THREE.Vector3[] }) => {
  const maxCount = 300; 
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Use centripetal curve for better corners
  const curve = useMemo(() => new THREE.CatmullRomCurve3(pathPoints, true, 'centripetal', 0.5), [pathPoints]);

  // Pre-calculate random offsets
  const particles = useMemo(() => {
    return new Array(maxCount).fill(0).map(() => ({
      position: Math.random(), 
      speedOffset: 0.5 + Math.random(), 
      radialOffset: Math.random() * Math.PI * 2,
      distOffset: Math.random() * 0.15,
    }));
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Speed is proportional to current
    const speed = current * 0.15;
    
    // Density (active particles) is proportional to current
    const activeCount = current < 0.05 ? 0 : Math.min(maxCount, Math.floor(20 + current * 20));

    for (let i = 0; i < maxCount; i++) {
      const p = particles[i];
      
      p.position += speed * p.speedOffset * delta;
      if (p.position > 1) p.position -= 1;

      if (i < activeCount) {
        const curvePoint = curve.getPoint(p.position);
        
        const jitterX = Math.sin(p.radialOffset) * p.distOffset;
        const jitterY = Math.cos(p.radialOffset) * p.distOffset;
        
        dummy.position.set(
          curvePoint.x + jitterX,
          curvePoint.y + jitterY,
          curvePoint.z
        );
        
        const s = 0.08;
        dummy.scale.set(s, s, s);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, maxCount]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#00f3ff" toneMapped={false} />
    </instancedMesh>
  );
};

export const CircuitScene = () => {
  const { voltage, resistance } = useStore();
  
  const current = resistance > 0 ? voltage / resistance : 0;
  const power = voltage * current;

  // Circuit Path Definitions (Rectangular loop)
  const w = 4;
  const h = 2.5;
  const pathPoints = useMemo(() => [
    new THREE.Vector3(-w, -h, 0),
    new THREE.Vector3(w, -h, 0),
    new THREE.Vector3(w, h, 0),
    new THREE.Vector3(-w, h, 0),
    new THREE.Vector3(-w, -h, 0), // Close loop
  ], []);

  return (
    <group>
      {/* 1. Circuit Components */}
      <group position={[-w, 0, 0]}>
        <Battery voltage={voltage} />
      </group>

      <group position={[w, 0, 0]}>
        <Resistor resistance={resistance} />
      </group>

      {/* Wires */}
      <mesh position={[0, h, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.1, w*2, 16]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>
      <mesh position={[0, -h, 0]} rotation={[0, 0, Math.PI/2]}>
        <cylinderGeometry args={[0.1, 0.1, w*2, 16]} />
        <meshStandardMaterial color="#444" metalness={0.8} />
      </mesh>
      
      {/* Corners */}
      {[[-w, h], [w, h], [w, -h], [-w, -h]].map((pos, i) => (
         <mesh key={i} position={[pos[0], pos[1], 0]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#444" />
         </mesh>
      ))}

      {/* 2. Meters */}
      <group position={[0, h + 0.5, 0]}>
        <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
          <Meter value={current} unit="A" label="Ammeter" color="#223344" />
        </Float>
      </group>

      <group position={[w + 1.5, 0, 0]}>
         <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
            <Meter value={voltage} unit="V" label="Voltmeter" color="#442222" />
         </Float>
         {/* Probe lines */}
         <line>
            <bufferGeometry>
               <float32BufferAttribute attach="attributes-position" count={6} array={[
                 -0.75, 0, 0,   -1.5, 2.5, 0,
                 -0.75, 0, 0,   -1.5, -2.5, 0
               ]} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial color="#ff5555" opacity={0.5} transparent />
         </line>
      </group>
      
      {/* Wattmeter - Repositioned to bottom center */}
      <group position={[0, -h - 1.2, 0]}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <Meter value={power} unit="W" label="Wattmeter" color="#443300" />
        </Float>
      </group>

      {/* Ohm's Law Formula Visualization - Top Center */}
      <Float position={[0, h + 2.5, 0]} speed={1} rotationIntensity={0} floatIntensity={0.2}>
         <group>
            {/* Background plate for readability */}
            <Box args={[6, 1.8, 0.1]} position={[0, 0, -0.1]}>
               <meshStandardMaterial color="#0f172a" opacity={0.8} transparent />
            </Box>
            
            {/* The Formula Text */}
            <Text fontSize={0.8} position={[-1.5, 0.3, 0]} color="#ffd700" characters="V=IxR">V</Text>
            <Text fontSize={0.5} position={[-0.9, 0.3, 0]} color="white">=</Text>
            <Text fontSize={0.8} position={[-0.3, 0.3, 0]} color="#00f3ff">I</Text>
            <Text fontSize={0.5} position={[0.3, 0.3, 0]} color="white">×</Text>
            <Text fontSize={0.8} position={[0.9, 0.3, 0]} color="#ff9a5c">R</Text>
            
            {/* Live values */}
            <Text fontSize={0.35} position={[-1.5, -0.5, 0]} color="#888">{voltage.toFixed(1)}</Text>
            <Text fontSize={0.35} position={[-0.3, -0.5, 0]} color="#888">{current.toFixed(2)}</Text>
            <Text fontSize={0.35} position={[0.9, -0.5, 0]} color="#888">{resistance.toFixed(1)}</Text>
            
            <Text fontSize={0.2} position={[2.5, 0, 0]} color="#64748b" font="monospace" rotation={[0,0,-Math.PI/2]}>
              OHM'S LAW
            </Text>
         </group>
      </Float>

      {/* 3. Electron Flow Animation */}
      <CircuitParticles current={current} pathPoints={pathPoints} />

      {/* Floor reflection - Lowered to avoid clipping graph */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#050912" roughness={0.5} metalness={0.5} opacity={0.5} transparent />
      </mesh>
    </group>
  );
};
