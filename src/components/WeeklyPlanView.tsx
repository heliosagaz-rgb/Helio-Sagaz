import React from 'react';
import type { DayPlan, Workout, Exercise } from '../types.ts';
import {
  Calendar,
  Clock,
  Flame,
  Play,
  CheckCircle2,
  Coffee,
  ChevronRight
} from 'lucide-react';

interface WeeklyPlanViewProps {
  schedule: DayPlan[];
  workouts: Workout[];
  onStartWorkout: (workout: Workout) => void;
  onViewWorkoutDetail: (workout: Workout) => void;
}

export const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({
  schedule = [],
  workouts = [],
  onStartWorkout,
  onViewWorkoutDetail,
}) => {
  const currentDayOfWeek = new Date().toLocaleDateString('pt-PT', { weekday: 'long' });

  // Map Portuguese weekday names safely
  const normalizeDay = (dayStr?: string) => {
    if (!dayStr || typeof dayStr !== 'string') return '';
    return dayStr.toLowerCase().replace('-feira', '').trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Plano de Treino Semanal</h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">Programação estruturada para manter a consistência e queima calórica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {(schedule || []).map((dayPlan, idx) => {
          const workoutId = dayPlan.workout_id || dayPlan.workoutId;
          const workout = workoutId
            ? workouts.find((w) => w.id === workoutId)
            : undefined;
          const isRest = dayPlan.is_rest ?? dayPlan.isRest ?? !workout;
          const effectiveWorkout = workout || (workouts.length > 0 ? workouts[idx % workouts.length] : undefined);
          const dayLabel = dayPlan.day || dayPlan.dayName || dayPlan.dayShort || `Dia ${idx + 1}`;
          const title = dayPlan.title || dayPlan.workoutTitle || (workout ? workout.name : (isRest ? 'Descanso Ativo' : 'Treino do Dia'));
          const dayPart = dayLabel.includes('-') ? dayLabel.split('-')[0] : dayLabel;
          const isToday = Boolean(dayPart && normalizeDay(currentDayOfWeek).includes(normalizeDay(dayPart)));

          return (
            <div
              key={idx}
              className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                isToday
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-500/20 shadow-xs'
                  : isRest
                  ? 'bg-stone-50/70 dark:bg-stone-800/50 border-stone-200/70 dark:border-stone-800'
                  : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 shadow-xs hover:border-stone-300 dark:hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {dayLabel}
                  </span>

                  {isToday && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Hoje
                    </span>
                  )}
                  {isRest && (
                    <span className="bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Descanso
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1">
                  {title}
                </h4>

                {!isRest && workout && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                    {workout.description}
                  </p>
                )}

                {isRest && (
                  <div className="mt-3 py-2.5 px-3 bg-white/70 dark:bg-stone-800/80 rounded-xl border border-stone-200/50 dark:border-stone-700 flex flex-col gap-2 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center gap-2">
                      <Coffee className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>Recuperação ativa (descanso planeado).</span>
                    </div>
                    {effectiveWorkout && (
                      <div className="pt-2 border-t border-stone-200/40 dark:border-stone-700/60 flex items-center justify-between">
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[130px]">
                          Opcional: {effectiveWorkout.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => onStartWorkout(effectiveWorkout)}
                          className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Treinar Hoje
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isRest && workout && (
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[11px] text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>{Number(workout.duration_minutes) || 30}m</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      <span>{Number(workout.calories_burned_est) || 250} kcal</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewWorkoutDetail(workout)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      Exercícios
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartWorkout(workout)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Começar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
