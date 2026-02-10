import React from 'react';
import { useStore } from '../store';
import { Scene } from './Scene';
import { Controls } from './Controls';
import { LESSONS } from '../constants';
import { CheckCircle, Circle, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Plotter Component (Moved to Overlay) ---
const Plotter = ({ points, currentV, currentI }: { points: {v: number, i: number}[], currentV: number, currentI: number }) => {
  const width = 340;
  const height = 220;
  const padding = 40;
  
  const maxX = 12.5; 
  const maxY = 2.5;  
  
  const mapX = (v: number) => padding + (v / maxX) * (width - 2 * padding);
  const mapY = (i: number) => height - padding - (i / maxY) * (height - 2 * padding);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/90 p-4 rounded-xl border-2 border-slate-500 shadow-2xl backdrop-blur-md w-[380px] select-none text-left"
    >
      <h3 className="text-neon-blue font-bold mb-2 text-sm flex justify-between items-center">
        <span>V-I Characteristic Graph</span>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-neon-yellow animate-pulse"></span>
           <span className="text-[10px] text-slate-400 font-mono">LIVE DATA</span>
        </div>
      </h3>
      <svg width={width} height={height} className="overflow-visible bg-slate-800/50 rounded-lg border border-slate-700">
        {/* Axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#94a3b8" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={padding} y2={padding} stroke="#94a3b8" strokeWidth="2" />
        
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8, 1].map(t => (
          <g key={t}>
             <line x1={padding} y1={mapY(maxY * t)} x2={width-padding} y2={mapY(maxY * t)} stroke="#334155" strokeDasharray="4" />
             <line x1={mapX(maxX * t)} y1={height-padding} x2={mapX(maxX * t)} y2={padding} stroke="#334155" strokeDasharray="4" />
          </g>
        ))}
        
        {/* Axis Labels */}
        <text x={width/2} y={height - 5} fill="#94a3b8" fontSize="12" textAnchor="middle" fontWeight="bold">Voltage (V)</text>
        <text x={15} y={height/2} fill="#94a3b8" fontSize="12" transform={`rotate(-90, 15, ${height/2})`} textAnchor="middle" fontWeight="bold">Current (I)</text>

        {/* Trend Line (Theoretical) */}
        {points.length > 0 && (
          <line 
            x1={padding} 
            y1={height - padding} 
            x2={mapX(12)} 
            y2={mapY(12 / (points[points.length-1].v / points[points.length-1].i || 10))} 
            stroke="#bc13fe" 
            strokeWidth="3" 
            opacity="0.4"
          />
        )}

        {/* Recorded Data Points */}
        {points.map((p, i) => (
          <circle key={i} cx={mapX(p.v)} cy={mapY(p.i)} r="5" fill="#00f3ff" stroke="white" strokeWidth="2" />
        ))}

        {/* LIVE CURSOR */}
        <g>
          <circle 
              cx={mapX(currentV)} 
              cy={mapY(currentI)} 
              r="6" 
              fill="transparent" 
              stroke="#f9f871" 
              strokeWidth="2" 
              strokeDasharray="2,2"
              opacity="0.8"
          >
              <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
          </circle>
          {/* Projection Lines */}
          <line x1={mapX(currentV)} y1={mapY(currentI)} x2={mapX(currentV)} y2={height-padding} stroke="#f9f871" strokeDasharray="3" opacity="0.4" />
          <line x1={mapX(currentV)} y1={mapY(currentI)} x2={padding} y2={mapY(currentI)} stroke="#f9f871" strokeDasharray="3" opacity="0.4" />
        </g>
      </svg>
      <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
         <span>Origin (0,0)</span>
         <span>Slope (1/R) = {(1/currentV*currentI || 0).toFixed(3)} S</span>
      </div>
    </motion.div>
  );
};

export const Layout = () => {
  const { currentLessonId, currentStepIndex, completedLessons, setLesson, nextStep, prevStep, voltage, resistance, measuredPoints } = useStore();
  
  const currentLesson = LESSONS.find(l => l.id === currentLessonId) || LESSONS[0];
  const currentStep = currentLesson.steps[currentStepIndex];
  
  // Calc current for the Plotter live cursor
  const currentI = resistance > 0 ? voltage / resistance : 0;
  const isLastStep = currentStepIndex === currentLesson.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
        // Find next lesson
        const currentIndex = LESSONS.findIndex(l => l.id === currentLessonId);
        if (currentIndex < LESSONS.length - 1) {
            setLesson(LESSONS[currentIndex + 1].id);
        } else {
            // End of all lessons, just mark current step/lesson complete logic handled by nextStep
            nextStep();
        }
    } else {
        nextStep();
    }
  };

  return (
    <div className="flex w-full h-screen bg-slate-950 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple tracking-tighter">
            VOLTLAB
          </h1>
          <p className="text-xs text-slate-500 mt-1">Interactive Physics Module</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {LESSONS.map((lesson) => {
             const isCompleted = completedLessons.includes(lesson.id);
             const isActive = lesson.id === currentLessonId;
             
             return (
               <button
                 key={lesson.id}
                 onClick={() => setLesson(lesson.id)}
                 className={`w-full text-left p-3 rounded-lg transition-all border ${
                   isActive 
                    ? 'bg-slate-800 border-neon-blue shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                    : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700'
                 }`}
               >
                 <div className="flex items-center justify-between mb-1">
                   <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>
                     {lesson.title}
                   </span>
                   {isCompleted ? <CheckCircle size={14} className="text-green-500" /> : <Circle size={14} className="text-slate-700" />}
                 </div>
                 <p className="text-xs text-slate-500 line-clamp-1">{lesson.shortDesc}</p>
               </button>
             );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* 3D Viewport */}
        <div className="flex-1 relative z-0">
          <Scene />
          
          {/* OVERLAY: GRAPH PLOTTER (Visible only in Ohm's Law Lesson) */}
          {currentLessonId === 'ohmslaw' && (
             // Moved to top-[40%] to give more space for the bottom instructions
             <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="pointer-events-auto">
                   <Plotter points={measuredPoints} currentV={voltage} currentI={currentI} />
                </div>
             </div>
          )}

          {/* Overlay Step Instruction */}
          {/* Changed right-96 to right-8 and added max-w to prevent text crushing on small screens */}
          <div className="absolute bottom-8 left-8 right-8 max-w-2xl pointer-events-none z-50">
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${currentLessonId}-${currentStepIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-2xl w-full pointer-events-auto"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-neon-blue uppercase tracking-widest">
                    Step {currentStepIndex + 1} of {currentLesson.steps.length}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={prevStep}
                      disabled={currentStepIndex === 0}
                      className="p-2 hover:bg-slate-800 rounded-full disabled:opacity-30 text-slate-300"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={handleNext}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all shadow-lg ${
                        isLastStep 
                          ? "bg-green-500 hover:bg-green-400 text-slate-900" 
                          : "bg-neon-blue hover:bg-cyan-300 text-slate-900"
                      }`}
                    >
                      {isLastStep ? (
                        <>Complete Lesson <ArrowRight size={18} /></>
                      ) : (
                        <ChevronRight size={24} />
                      )}
                    </button>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {currentStep.description}
                </p>
                {currentStep.hint && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-yellow-300/90 bg-yellow-400/5 p-3 rounded-lg border border-yellow-400/10">
                    <span>💡</span>
                    <span>{currentStep.hint}</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Right Controls Panel */}
      <Controls />
    </div>
  );
};
