export type MaterialType = 'copper' | 'gold' | 'silicon' | 'glass';

export interface MaterialProperties {
  name: string;
  resistivity: number; // ohm-meters
  electronDensity: number; // normalized factor for visual density
  color: string;
  roughness: number;
}

export interface SimulationState {
  voltage: number;      // Volts
  resistance: number;   // Ohms (base)
  length: number;       // Meters
  area: number;         // mm^2
  temperature: number;  // Kelvin
  material: MaterialType;
  isPlaying: boolean;
}

export interface CircuitPoint {
  v: number;
  i: number;
}

export interface LessonStep {
  title: string;
  description: string;
  hint?: string;
  targetValues?: Partial<SimulationState>; // For guided completion
}

export interface Lesson {
  id: string;
  title: string;
  shortDesc: string;
  sceneMode: 'wire' | 'block' | 'circuit';
  steps: LessonStep[];
}

export interface AppState extends SimulationState {
  currentLessonId: string;
  currentStepIndex: number;
  completedLessons: string[];
  
  // Circuit Lab Specific
  measuredPoints: CircuitPoint[];
  circuitComponents: {
    hasBattery: boolean;
    hasResistor: boolean;
  };
  
  // Actions
  setVoltage: (v: number) => void;
  setResistance: (r: number) => void;
  setLength: (l: number) => void;
  setArea: (a: number) => void;
  setMaterial: (m: MaterialType) => void;
  setTemperature: (t: number) => void;
  setLesson: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  togglePlay: () => void;
  
  // Circuit Actions
  addMeasuredPoint: () => void;
  clearMeasuredPoints: () => void;
  toggleCircuitComponent: (component: 'battery' | 'resistor', value: boolean) => void;
}
