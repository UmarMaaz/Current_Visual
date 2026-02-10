import { create } from 'zustand';
import { AppState, MaterialType } from './types';
import { LESSONS } from './constants';

// Initial State
const initialState = {
  voltage: 0,
  resistance: 10,
  length: 1,
  area: 5,
  temperature: 300,
  material: 'copper' as MaterialType,
  isPlaying: true,
  currentLessonId: 'current',
  currentStepIndex: 0,
  completedLessons: [],
  measuredPoints: [],
  circuitComponents: {
    hasBattery: true,
    hasResistor: true,
  }
};

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  setVoltage: (v) => set({ voltage: v }),
  setResistance: (r) => set({ resistance: r }),
  setLength: (l) => set({ length: l }),
  setArea: (a) => set({ area: a }),
  setMaterial: (m) => set({ material: m }),
  setTemperature: (t) => set({ temperature: t }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setLesson: (id) => {
    // Reset defaults when changing lesson
    set({ 
      currentLessonId: id, 
      currentStepIndex: 0,
      // Auto start voltage: 0 for basics and power (to show effect), 5 for others
      voltage: (id === 'basics' || id === 'power') ? 0 : 5,
      resistance: 10,
      material: 'copper',
      measuredPoints: [], // Clear graph
      circuitComponents: { hasBattery: true, hasResistor: true }
    });
  },

  nextStep: () => {
    const { currentLessonId, currentStepIndex, completedLessons } = get();
    const lesson = LESSONS.find(l => l.id === currentLessonId);
    
    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    } else {
      // Mark complete
      if (!completedLessons.includes(currentLessonId)) {
        set({ completedLessons: [...completedLessons, currentLessonId] });
      }
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  // Circuit Lab Actions
  addMeasuredPoint: () => {
    const { voltage, resistance, measuredPoints } = get();
    const current = resistance > 0 ? voltage / resistance : 0;
    // Prevent duplicates close to each other
    const exists = measuredPoints.some(p => Math.abs(p.v - voltage) < 0.1 && Math.abs(p.i - current) < 0.01);
    if (!exists) {
      set({ measuredPoints: [...measuredPoints, { v: voltage, i: current }] });
    }
  },

  clearMeasuredPoints: () => set({ measuredPoints: [] }),
  
  toggleCircuitComponent: (comp, val) => set(state => ({
    circuitComponents: { ...state.circuitComponents, [comp === 'battery' ? 'hasBattery' : 'hasResistor']: val }
  }))
}));
