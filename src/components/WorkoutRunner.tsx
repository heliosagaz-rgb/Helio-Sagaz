import React, { useState, useEffect, useRef } from 'react';
import type { Workout, Exercise } from '../types.ts';
import { ExerciseVisualPlayer } from './ExerciseVisualPlayer.tsx';
import { api } from '../services/api.ts';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  X,
  Volume2,
  VolumeX,
  Plus
} from 'lucide-react';

interface WorkoutRunnerProps {
  workout: Workout & { exercises: Exercise[] };
  onClose: () => void;
  onWorkoutCompleted?: () => void;
}

export const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({
  workout,
  onClose,
  onWorkoutCompleted,
}) => {
  const exercises = workout.exercises && workout.exercises.length > 0 ? workout.exercises : [];
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Overall workout stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Completed sets tracker
  const [completedSetsCount, setCompletedSetsCount] = useState(0);

  const currentExercise: Exercise | undefined = exercises[currentExIndex];
  const totalSetsForCurrent = currentExercise?.sets || 3;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sound beep using Web Audio API
  const playBeep = (freq = 880, duration = 0.2) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current) {
        if (audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  // Stopwatch for overall workout duration
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Rest Countdown Timer
  useEffect(() => {
    if (isResting && !isPaused && restSecondsLeft > 0) {
      timerRef.current = setTimeout(() => {
        if (restSecondsLeft === 3 || restSecondsLeft === 2 || restSecondsLeft === 1) {
          playBeep(440, 0.1);
        }
        setRestSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (isResting && restSecondsLeft === 0) {
      playBeep(880, 0.4);
      setIsResting(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isResting, isPaused, restSecondsLeft]);

  const handleFinishSet = () => {
    setCompletedSetsCount((prev) => prev + 1);
    playBeep(600, 0.15);

    if (currentSet < totalSetsForCurrent) {
      // Move to next set and trigger rest
      setCurrentSet((prev) => prev + 1);
      startRest(currentExercise?.rest_seconds || 45);
    } else {
      // Finished all sets of this exercise
      if (currentExIndex < exercises.length - 1) {
        setCurrentExIndex((prev) => prev + 1);
        setCurrentSet(1);
        startRest(60); // Transition rest between different exercises
      } else {
        // Complete entire workout!
        setIsCompleted(true);
        playBeep(987, 0.6);
      }
    }
  };

  const startRest = (seconds: number) => {
    setRestSecondsLeft(seconds);
    setIsResting(true);
    setIsPaused(false);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestSecondsLeft(0);
  };

  const addRestTime = (seconds: number) => {
    setRestSecondsLeft((prev) => prev + seconds);
  };

  const handleSaveWorkout = async () => {
    setIsSaving(true);
    try {
      const estimatedCalories = Math.round(
        (workout.calories_burned_est / (workout.duration_minutes * 60)) * Math.max(elapsedSeconds, 300)
      );

      await api.logCompletedWorkout({
        workout_id: workout.id,
        workout_name: workout.name,
        duration_seconds: elapsedSeconds,
        calories_burned: estimatedCalories || workout.calories_burned_est,
        exercises_completed: exercises.length,
        total_exercises: exercises.length,
        total_sets: completedSetsCount,
      });

      setSavedSuccess(true);
      if (onWorkoutCompleted) {
        onWorkoutCompleted();
      }
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Failed to save workout:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  // ---------------- FINISHED SCREEN ----------------
  if (isCompleted) {
    const estimatedCalories = Math.round(
      (workout.calories_burned_est / (workout.duration_minutes * 60)) * Math.max(elapsedSeconds, 300)
    );

    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-6 shadow-inner">
            <Trophy className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Treino Concluído! 🎉
          </h2>
          <p className="text-sm text-stone-400 mt-2">
            Excelente trabalho! Mais um passo firme em direção aos seus objetivos.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
            <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
              <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[11px] text-stone-400 block">Duração</span>
              <span className="text-base font-bold text-white">{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
              <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[11px] text-stone-400 block">Calorias</span>
              <span className="text-base font-bold text-amber-400">~{estimatedCalories} kcal</span>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
              <CheckCircle2 className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[11px] text-stone-400 block">Exercícios</span>
              <span className="text-base font-bold text-white">{exercises.length}</span>
            </div>

            <div className="bg-stone-800/80 p-3 rounded-2xl border border-stone-700/60">
              <Dumbbell className="w-4 h-4 text-purple-400 mx-auto mb-1" />
              <span className="text-[11px] text-stone-400 block">Séries</span>
              <span className="text-base font-bold text-white">{completedSetsCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              id="btn-save-workout"
              type="button"
              disabled={isSaving || savedSuccess}
              onClick={handleSaveWorkout}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 hover:shadow-emerald-500/20'
              }`}
            >
              {isSaving ? (
                <span>A guardar progresso...</span>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Guardado com sucesso!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Guardar treino no histórico</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl text-xs font-semibold text-stone-400 hover:text-white transition-colors"
            >
              Fechar sem guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="fixed inset-0 z-50 bg-stone-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-stone-400">Nenhum exercício encontrado neste treino.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-stone-800 rounded-xl text-sm">Fechar</button>
        </div>
      </div>
    );
  }

  // ---------------- ACTIVE WORKOUT SCREEN ----------------
  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-white flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Sair do treino"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
              {workout.name}
            </h2>
            <p className="text-[11px] text-emerald-400 font-medium">
              Exercício {currentExIndex + 1} de {exercises.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-stone-800 px-3 py-1.5 rounded-full text-xs font-mono font-semibold text-stone-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 text-stone-400 hover:text-white rounded-full transition-colors"
            title={soundEnabled ? 'Silenciar bips' : 'Ativar bips'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress Bar across all exercises */}
      <div className="w-full bg-stone-800 h-1">
        <div
          className="bg-emerald-500 h-1 transition-all duration-300"
          style={{ width: `${((currentExIndex + (currentSet / totalSetsForCurrent)) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Main Runner Body */}
      <div className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full flex flex-col justify-between">
        <div className="space-y-4">
          {/* Exercise Visual Animated Demonstration */}
          <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-lg">
            <ExerciseVisualPlayer exercise={currentExercise} isPlaying={!isResting} showControls={true} />
          </div>

          {/* Exercise Title and Sets tracker */}
          <div className="bg-stone-900/90 border border-stone-800/80 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                  {currentExercise.muscle_group}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  {currentExercise.name}
                </h1>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-400 block">Alvo</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {totalSetsForCurrent} × {currentExercise.reps}
                </span>
              </div>
            </div>

            {/* Set tracker bubbles */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-stone-400">Progresso da série:</span>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSetsForCurrent }).map((_, idx) => {
                  const setNum = idx + 1;
                  const isDone = setNum < currentSet;
                  const isCurrent = setNum === currentSet;

                  return (
                    <div
                      key={idx}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500 scale-110 shadow-xs'
                          : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : setNum}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Rest Countdown Overlay Card */}
          {isResting && (
            <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-5 text-center shadow-xl animate-in fade-in zoom-in-95 duration-200">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block mb-1">
                Tempo de Descanso
              </span>
              <div className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight my-1">
                {restSecondsLeft}s
              </div>
              <p className="text-xs text-stone-300 mb-4">
                Inspire profundamente pelo nariz, expire pela boca e hidrate-se.
              </p>

              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => addRestTime(15)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+15s</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 transition-colors"
                >
                  {isPaused ? 'Retomar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  onClick={skipRest}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition-colors"
                >
                  Pular descanso
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="pt-4 pb-2 space-y-3">
          {!isResting ? (
            <button
              id="btn-finish-set"
              type="button"
              onClick={handleFinishSet}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {currentSet === totalSetsForCurrent && currentExIndex === exercises.length - 1
                  ? 'Concluir Treino 🎉'
                  : `Concluir Série ${currentSet} de ${totalSetsForCurrent}`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={skipRest}
              className="w-full py-3.5 px-6 rounded-2xl bg-stone-800 hover:bg-stone-700 text-emerald-400 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4" />
              <span>Pronto para a próxima série ({currentSet}/{totalSetsForCurrent})</span>
            </button>
          )}

          {/* Skip / Previous Exercise nav */}
          <div className="flex items-center justify-between px-2 text-xs text-stone-400">
            <button
              type="button"
              disabled={currentExIndex === 0}
              onClick={() => {
                if (currentExIndex > 0) {
                  setCurrentExIndex((prev) => prev - 1);
                  setCurrentSet(1);
                  setIsResting(false);
                }
              }}
              className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:hover:text-stone-400"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <span className="text-[11px] text-stone-500">
              {currentExercise.equipment === 'nenhum' ? 'Sem equipamento' : currentExercise.equipment}
            </span>

            <button
              type="button"
              onClick={() => {
                if (currentExIndex < exercises.length - 1) {
                  setCurrentExIndex((prev) => prev + 1);
                  setCurrentSet(1);
                  setIsResting(false);
                } else {
                  setIsCompleted(true);
                }
              }}
              className="flex items-center gap-1 hover:text-white"
            >
              <span>{currentExIndex < exercises.length - 1 ? 'Próximo exercício' : 'Finalizar'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
