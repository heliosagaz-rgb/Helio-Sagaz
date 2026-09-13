import React, { useState } from 'react';
import type { Exercise } from '../types.ts';
import { Play, RotateCcw, Activity, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface ExerciseVisualPlayerProps {
  exercise: Exercise;
  isPlaying?: boolean;
  className?: string;
  showControls?: boolean;
}

export const ExerciseVisualPlayer: React.FC<ExerciseVisualPlayerProps> = ({
  exercise,
  isPlaying = true,
  className = '',
  showControls = true,
}) => {
  const [activeTab, setActiveTab] = useState<'animacao' | 'imagem'>('animacao');
  const [imageError, setImageError] = useState(false);
  const [isLooping, setIsLooping] = useState(isPlaying);

  // SVG Animated Motion Renderers based on exercise animation type
  const renderKineticAnimation = () => {
    const type = exercise.animation_type || 'squat';

    switch (type) {
      case 'squat':
      case 'sumo_squat':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 select-none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes squatCycle {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(32px); }
              }
              @keyframes legFlexLeft {
                0%, 100% { d: path("M85,120 L80,150 L75,180"); }
                50% { d: path("M85,152 L60,165 L70,180"); }
              }
              @keyframes legFlexRight {
                0%, 100% { d: path("M115,120 L120,150 L125,180"); }
                50% { d: path("M115,152 L140,165 L130,180"); }
              }
              .squat-torso {
                animation: squatCycle ${isLooping ? '2.4s' : '0s'} ease-in-out infinite;
                transform-origin: center bottom;
              }
              .squat-leg-left { animation: legFlexLeft ${isLooping ? '2.4s' : '0s'} ease-in-out infinite; }
              .squat-leg-right { animation: legFlexRight ${isLooping ? '2.4s' : '0s'} ease-in-out infinite; }
            `}</style>
            {/* Ground Line */}
            <line x1="30" y1="182" x2="170" y2="182" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
            
            {/* Legs */}
            <path className="squat-leg-left" d="M85,120 L80,150 L75,180" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path className="squat-leg-right" d="M115,120 L120,150 L125,180" stroke="#059669" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            
            {/* Torso & Head */}
            <g className="squat-torso">
              {/* Head */}
              <circle cx="100" cy="55" r="14" fill="#10b981" />
              {/* Spine/Chest */}
              <line x1="100" y1="69" x2="100" y2="125" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
              {/* Arms */}
              <path d="M100,80 L75,100 L100,105" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M100,80 L125,100 L100,105" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              {/* Joint markers */}
              <circle cx="100" cy="80" r="4" fill="#ecfdf5" stroke="#047857" strokeWidth="2" />
              <circle cx="100" cy="125" r="5" fill="#f59e0b" />
            </g>
          </svg>
        );

      case 'pushup':
      case 'incline_pushup':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 select-none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes pushupBody {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(24px) rotate(2deg); }
              }
              @keyframes pushupArm {
                0%, 100% { d: path("M135,130 L135,165"); }
                50% { d: path("M135,154 L115,160 L135,165"); }
              }
              .pushup-plank {
                animation: pushupBody ${isLooping ? '2.2s' : '0s'} ease-in-out infinite;
                transform-origin: 40px 165px;
              }
              .pushup-elbow { animation: pushupArm ${isLooping ? '2.2s' : '0s'} ease-in-out infinite; }
            `}</style>
            <line x1="20" y1="168" x2="180" y2="168" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
            {/* Pushup body */}
            <g className="pushup-plank">
              {/* Head */}
              <circle cx="155" cy="115" r="12" fill="#10b981" />
              {/* Body line (Feet at 45,165 to Neck at 145,120) */}
              <line x1="45" y1="165" x2="145" y2="120" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
              {/* Foot pivot */}
              <circle cx="45" cy="165" r="4" fill="#f59e0b" />
              {/* Arm / Elbow */}
              <path className="pushup-elbow" d="M135,130 L135,165" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="135" cy="130" r="4" fill="#ecfdf5" stroke="#047857" strokeWidth="2" />
            </g>
          </svg>
        );

      case 'jumping_jacks':
      case 'skaters':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 select-none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes jackJump {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-16px); }
              }
              @keyframes jackLimbs {
                0%, 100% {
                  stroke-dashoffset: 0;
                }
              }
              .jack-body {
                animation: jackJump ${isLooping ? '1.2s' : '0s'} cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
            `}</style>
            <line x1="30" y1="182" x2="170" y2="182" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
            <g className="jack-body">
              <circle cx="100" cy="50" r="13" fill="#10b981" />
              <line x1="100" y1="63" x2="100" y2="120" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
              {/* Legs spreading */}
              <line x1="100" y1="120" x2="70" y2="178" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="120" x2="130" y2="178" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              {/* Arms extending overhead */}
              <line x1="100" y1="75" x2="60" y2="40" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="75" x2="140" y2="40" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
        );

      case 'plank':
      case 'side_plank':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 select-none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes plankPulse {
                0%, 100% { opacity: 0.9; }
                50% { opacity: 1; filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.4)); }
              }
              .plank-glow {
                animation: plankPulse ${isLooping ? '2s' : '0s'} ease-in-out infinite;
              }
            `}</style>
            <line x1="20" y1="165" x2="180" y2="165" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
            <g className="plank-glow">
              {/* Head */}
              <circle cx="150" cy="120" r="12" fill="#10b981" />
              {/* Spine straight */}
              <line x1="45" y1="155" x2="140" y2="125" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
              {/* Elbow support */}
              <line x1="135" y1="130" x2="135" y2="165" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              <line x1="135" y1="165" x2="155" y2="165" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
              {/* Core focus indicator */}
              <circle cx="95" cy="140" r="8" fill="#f59e0b" opacity="0.8" />
              <text x="95" y="178" fontSize="10" fontWeight="600" fill="#6b7280" textAnchor="middle">CORE ATIVADO</text>
            </g>
          </svg>
        );

      case 'glute_bridge':
      case 'donkey_kicks':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 select-none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes bridgeElevate {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-24px); }
              }
              .bridge-hips {
                animation: bridgeElevate ${isLooping ? '2.4s' : '0s'} ease-in-out infinite;
                transform-origin: 50px 165px;
              }
            `}</style>
            <line x1="20" y1="168" x2="180" y2="168" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
            <g className="bridge-hips">
              {/* Head & shoulders resting */}
              <circle cx="50" cy="155" r="12" fill="#10b981" />
              {/* Torso & hips lifting */}
              <line x1="60" y1="160" x2="110" y2="130" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
              {/* Knees & feet */}
              <line x1="110" y1="130" x2="140" y2="130" stroke="#059669" strokeWidth="7" strokeLinecap="round" />
              <line x1="140" y1="130" x2="140" y2="168" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              <circle cx="110" cy="130" r="6" fill="#f59e0b" />
            </g>
          </svg>
        );

      default:
        // Generic active movement animation
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 select-none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes generalMove {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.04); }
              }
              .gen-figure { animation: generalMove ${isLooping ? '2s' : '0s'} ease-in-out infinite; transform-origin: center; }
            `}</style>
            <line x1="30" y1="180" x2="170" y2="180" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
            <g className="gen-figure">
              <circle cx="100" cy="60" r="14" fill="#10b981" />
              <line x1="100" y1="74" x2="100" y2="128" stroke="#047857" strokeWidth="8" strokeLinecap="round" />
              <line x1="100" y1="128" x2="75" y2="178" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="128" x2="125" y2="178" stroke="#059669" strokeWidth="6" strokeLinecap="round" />
              <line x1="100" y1="85" x2="65" y2="110" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
              <line x1="100" y1="85" x2="135" y2="110" stroke="#10b981" strokeWidth="5" strokeLinecap="round" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div className={`relative bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-sm flex flex-col ${className}`}>
      {/* Top badges & controls */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-xs font-semibold text-emerald-400">
          <Activity className="w-3.5 h-3.5" />
          <span>{(exercise?.muscle_group || exercise?.category || 'Geral').split(',')[0]}</span>
        </div>

        {showControls && (
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-0.5 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('animacao')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === 'animacao' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Animação
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('imagem')}
              className={`px-2.5 py-0.5 text-xs font-medium rounded-full transition-colors ${
                activeTab === 'imagem' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              Foto
            </button>
          </div>
        )}
      </div>

      {/* Main Visual Display Area */}
      <div className="relative w-full h-56 sm:h-64 flex items-center justify-center bg-gradient-to-b from-stone-950 to-stone-900 overflow-hidden">
        {activeTab === 'animacao' ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            {renderKineticAnimation()}
            <div className="absolute bottom-2 left-4 text-[11px] text-stone-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Demonstração do movimento</span>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {!imageError ? (
              <img
                src={exercise.image_url}
                alt={exercise.name}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 p-4">
                <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs">Foto indisponível. Veja a animação interativa.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('animacao')}
                  className="mt-2 text-xs font-medium text-emerald-400 hover:underline"
                >
                  Voltar à animação
                </button>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Bottom Pacing & Parameters Strip */}
      <div className="bg-stone-950 px-4 py-2.5 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-400">{exercise.sets} Séries</span>
          <span className="text-stone-500">•</span>
          <span>{exercise.reps} Reps</span>
          <span className="text-stone-500">•</span>
          <span>{exercise.rest_seconds}s descanso</span>
        </div>

        {activeTab === 'animacao' && (
          <button
            type="button"
            onClick={() => setIsLooping(!isLooping)}
            className="flex items-center gap-1 text-stone-400 hover:text-white transition-colors"
            title={isLooping ? 'Pausar animação' : 'Executar animação'}
          >
            {isLooping ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isLooping ? 'Repetindo' : 'Pausado'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
