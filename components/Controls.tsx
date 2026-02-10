import React from 'react';
import { useStore } from '../store';
import { MATERIALS, LESSONS } from '../constants';
import { Zap, Ruler, Maximize, Thermometer, Box, Activity, Trash2, PlusCircle, Flame } from 'lucide-react';
import { MaterialType } from '../types';

export const Controls = () => {
  const store = useStore();
  const currentLesson = LESSONS.find(l => l.id === store.currentLessonId);
  const isCircuitMode = currentLesson?.sceneMode === 'circuit';
  const isPowerLesson = store.currentLessonId === 'power';

  // Calculate derived values for display
  let R = 0, I = 0, P = 0, J = 0;
  if (isCircuitMode) {
      R = store.resistance;
      I = R > 0 ? store.voltage / R : 0;
  } else {
      const mat = MATERIALS[store.material];
      R = (mat.resistivity * store.length) / (store.area * 1e-6);
      I = R > 0 ? store.voltage / R : 0;
      J = I / (store.area * 1e-6);
  }
  P = I * store.voltage;

  return (
    <div className="h-full bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto w-80 flex flex-col gap-6 shadow-2xl z-10">
      <h2 className="text-xl font-bold text-neon-blue flex items-center gap-2">
        <Zap className="w-5 h-5" /> {isCircuitMode ? 'Circuit Lab' : 'Lab Controls'}
      </h2>

      {/* Voltage Control - Always Visible */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-300">
          <span>Voltage (Push)</span>
          <span className="font-mono text-neon-yellow">{store.voltage.toFixed(1)} V</span>
        </div>
        <input
          type="range"
          min="0"
          max="12"
          step="0.1"
          value={store.voltage}
          onChange={(e) => store.setVoltage(parseFloat(e.target.value))}
          className="w-full accent-neon-blue h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {isCircuitMode ? (
        // CIRCUIT MODE CONTROLS
        <div className="space-y-6 border-t border-slate-700 pt-4 animate-in fade-in slide-in-from-right-4">
          
          {/* Direct Resistance Control */}
          <div className="space-y-2">
             <div className="flex justify-between text-sm text-slate-300">
               <span className="flex items-center gap-2"><Box size={14} /> Resistor Value</span>
               <span className="font-mono text-orange-400">{store.resistance.toFixed(0)} Ω</span>
             </div>
             <input
               type="range"
               min="1"
               max="100"
               step="1"
               value={store.resistance}
               onChange={(e) => store.setResistance(parseFloat(e.target.value))}
               className="w-full accent-orange-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
             />
          </div>

          {/* Plotter Controls */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-slate-400 flex items-center gap-2">
              <Activity size={14} /> Experiment Tools
            </h3>
            <p className="text-xs text-slate-500">
              Adjust Voltage or Resistance, then record the point on the graph to prove Ohm's Law.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={store.addMeasuredPoint}
                className="flex items-center justify-center gap-2 bg-neon-blue text-slate-900 py-2 rounded font-bold text-xs hover:bg-cyan-300 transition-colors"
              >
                <PlusCircle size={14} /> Record Point
              </button>
              <button 
                onClick={store.clearMeasuredPoints}
                className="flex items-center justify-center gap-2 bg-slate-700 text-slate-300 py-2 rounded font-bold text-xs hover:bg-red-900/50 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} /> Clear Graph
              </button>
            </div>
          </div>
        </div>
      ) : (
        // STANDARD MODE CONTROLS (Wire/Block)
        <>
          {/* Geometry Controls */}
          <div className="space-y-4 border-t border-slate-700 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span className="flex items-center gap-2"><Ruler size={14} /> Length</span>
                <span className="font-mono text-cyan-400">{store.length.toFixed(1)} m</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.1"
                value={store.length}
                onChange={(e) => store.setLength(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-300">
                <span className="flex items-center gap-2"><Maximize size={14} /> Area (Cross-sec)</span>
                <span className="font-mono text-cyan-400">{store.area.toFixed(1)} mm²</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={store.area}
                onChange={(e) => store.setArea(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Material Selector */}
          <div className="space-y-2 border-t border-slate-700 pt-4">
            <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
              <Box size={14} /> Material
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MATERIALS) as MaterialType[]).map((m) => (
                <button
                  key={m}
                  onClick={() => store.setMaterial(m)}
                  className={`px-3 py-2 text-xs rounded-md border transition-all ${
                    store.material === m
                      ? 'bg-neon-blue/20 border-neon-blue text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {MATERIALS[m].name}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Control */}
          <div className="space-y-2 border-t border-slate-700 pt-4">
             <div className="flex justify-between text-sm text-slate-300">
                <span className="flex items-center gap-2">
                  <Thermometer size={14} className={isPowerLesson ? "text-red-500 animate-pulse" : ""} /> 
                  Temperature {isPowerLesson && "(Simulated)"}
                </span>
                <span className={`font-mono ${store.temperature > 400 ? 'text-red-500' : 'text-red-400'}`}>
                  {store.temperature.toFixed(0)} K
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="1000"
                step="10"
                value={store.temperature}
                disabled={isPowerLesson} // Disable manual control during Power lesson
                onChange={(e) => store.setTemperature(parseFloat(e.target.value))}
                className={`w-full h-2 rounded-lg ${isPowerLesson ? 'bg-slate-800 accent-slate-600 cursor-not-allowed' : 'bg-slate-700 accent-red-500 cursor-pointer'}`}
              />
              {isPowerLesson && (
                <p className="text-[10px] text-slate-500">
                  <Flame size={10} className="inline mr-1" />
                  Temperature rises with Power (I²R)
                </p>
              )}
          </div>
        </>
      )}

      {/* Calculated Stats Display */}
      <div className="mt-auto bg-slate-800 p-4 rounded-lg border border-slate-600 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Metrics</h3>
        
        {/* Resistance */}
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">R (Resistance)</span>
          <span>{store.material === 'glass' && !isCircuitMode ? '>1 GΩ' : R.toFixed(isCircuitMode ? 1 : 4) + ' Ω'}</span>
        </div>
        
        {/* Current */}
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">I (Current)</span>
          <span className="text-neon-yellow">{store.material === 'glass' && !isCircuitMode ? '~0 A' : I.toFixed(2) + ' A'}</span>
        </div>
        
        {/* Power - Newly Added */}
        <div className="flex justify-between font-mono text-sm">
          <span className="text-slate-400">P (Power)</span>
          <span className="text-orange-400">{P < 0.01 ? '0.00' : P.toFixed(2)} W</span>
        </div>

        {/* Current Density - Only in Material Mode */}
        {!isCircuitMode && (
          <div className="flex justify-between font-mono text-xs">
            <span className="text-slate-400">J (Density)</span>
            <span className="text-neon-purple">{store.material === 'glass' ? '0' : (J/1e6).toFixed(2) + ' MA/m²'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
