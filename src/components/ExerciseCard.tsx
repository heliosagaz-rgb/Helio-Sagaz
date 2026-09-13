import React, { useState } from 'react';
import type { Exercise } from '../types.ts';
import { ExerciseVisualPlayer } from './ExerciseVisualPlayer.tsx';
import { Flame, Clock, Dumbbell, ChevronRight, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  compact?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onSelect,
  compact = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'iniciante': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediario': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'avancado': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermédio';
      case 'avancado': return 'Avançado';
      default: return diff;
    }
  };

  return (
    <>
      <div
        id={`exercise-card-${exercise.id}`}
        className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
      >
        {/* Visual Header */}
        <div className="relative">
          <ExerciseVisualPlayer exercise={exercise} showControls={!compact} />
          
          <div className="absolute top-3 right-3 z-10 flex gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getDifficultyColor(exercise.difficulty)}`}>
              {getDifficultyLabel(exercise.difficulty)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {exercise.name}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
              {exercise.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="capitalize">{exercise.equipment === 'nenhum' ? 'Sem pesos' : exercise.equipment}</span>
              </span>
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>~{exercise.calories_per_min || 8} kcal/min</span>
              </span>
            </div>

            <button
              id={`btn-view-exercise-${exercise.id}`}
              type="button"
              onClick={() => {
                if (onSelect) onSelect(exercise);
                setShowModal(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2.5 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-800 transition-colors"
            >
              <span>Ver detalhes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header */}
            <div className="relative">
              <ExerciseVisualPlayer exercise={exercise} showControls={true} />
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(exercise.difficulty)}`}>
                    {getDifficultyLabel(exercise.difficulty)}
                  </span>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    Equipamento: <strong className="text-stone-800 dark:text-stone-200 capitalize">{exercise.equipment}</strong>
                  </span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-2">{exercise.name}</h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-1">{exercise.description}</p>
              </div>

              {/* Protocol Specs */}
              <div className="grid grid-cols-3 gap-3 bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-700 text-center">
                <div>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block uppercase">Séries</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{exercise.sets}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block uppercase">Repetições</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{exercise.reps}</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block uppercase">Descanso</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{exercise.rest_seconds}s</span>
                </div>
              </div>

              {/* Step-by-step instructions */}
              <div>
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Como fazer (Passo a passo):
                </h4>
                <ol className="space-y-2">
                  {exercise.instructions.map((step, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex gap-2.5 leading-relaxed">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center mt-0.5 border border-emerald-300/40 dark:border-emerald-800">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips & Posture */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-3.5">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Dicas de postura e segurança:
                  </h4>
                  <ul className="space-y-1">
                    {exercise.tips.map((tip, idx) => (
                      <li key={idx} className="text-xs text-amber-800 dark:text-amber-300/90 list-disc list-inside">
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-850 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
