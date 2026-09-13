import React, { useState, useEffect } from 'react';
import type { User, Workout, WeightRecord, DayPlan } from '../types.ts';
import { api } from '../services/api.ts';
import { WeightChart } from '../components/WeightChart.tsx';
import { CalorieTracker } from '../components/CalorieTracker.tsx';
import { HabitsTracker } from '../components/HabitsTracker.tsx';
import {
  Flame,
  Scale,
  TrendingDown,
  Target,
  Play,
  Calendar,
  Clock,
  Sparkles,
  Droplets,
  Dumbbell,
  CheckCircle2,
  ChevronRight,
  Lightbulb
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  onStartWorkout: (workout: Workout) => void;
  onNavigate: (view: string) => void;
  onWeightUpdated?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onStartWorkout,
  onNavigate,
  onWeightUpdated,
}) => {
  const [recommendedPlan, setRecommendedPlan] = useState<{
    schedule: DayPlan[];
    today: { plan: DayPlan; workout: Workout };
    recommendationSummary: any;
  } | null>(null);

  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily tips library
  const dailyTips = [
    { title: 'Hidratação Matinal', text: 'Beba 500ml de água logo ao acordar para ativar o metabolismo e a digestão.' },
    { title: 'Proteína nas Refeições', text: 'Incluir proteína magra em todas as refeições reduz a fome e preserva a massa muscular.' },
    { title: 'Sono Reparador', text: 'Dormir entre 7 e 8 horas regula os hormónios da saciedade (leptina e grelina).' },
    { title: 'Passos Diários', text: 'Uma caminhada leve de 15 minutos após as refeições melhora a sensibilidade à insulina.' },
  ];
  const tipOfDay = dailyTips[new Date().getDay() % dailyTips.length];

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [planRes, weightRes, habitsRes] = await Promise.all([
        api.getRecommendedPlan().catch(() => null),
        api.getWeightRecords().catch(() => []),
        api.getHabits().catch(() => []),
      ]);

      if (planRes) setRecommendedPlan(planRes);
      setWeightRecords(weightRes);
      setHabits(habitsRes);
    } catch (err) {
      console.error('Failed loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddWeight = async (data: any) => {
    await api.logWeight(data);
    const updated = await api.getWeightRecords();
    setWeightRecords(updated);
    if (onWeightUpdated) onWeightUpdated();
  };

  const handleDeleteWeight = async (id: string) => {
    await api.deleteWeight(id);
    const updated = await api.getWeightRecords();
    setWeightRecords(updated);
    if (onWeightUpdated) onWeightUpdated();
  };

  const handleToggleHabit = async (habitId: string) => {
    await api.toggleHabit(habitId);
    const updated = await api.getHabits();
    setHabits(updated);
  };

  // Progress Calculations
  const currentWeight = user.current_weight || (weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : 70);
  const targetWeight = user.target_weight || 62;
  const initialWeight = weightRecords.length > 0 ? weightRecords[0].weight : currentWeight;
  const lostKg = Math.max(0, initialWeight - currentWeight);
  const totalGoalToLose = Math.max(0.1, initialWeight - targetWeight);
  const goalPercentage = Math.min(100, Math.round((lostKg / totalGoalToLose) * 100));
  const remainingKg = Math.max(0, currentWeight - targetWeight);

  const todayWorkout = recommendedPlan?.today?.workout;
  const todayPlan = recommendedPlan?.today?.plan;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcoming Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Foco no seu objetivo diário</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Olá, {user?.name || user?.email?.split('@')[0] || 'Atleta'} 👋
          </h1>
          <p className="text-sm text-emerald-100 mt-1 leading-relaxed">
            Vamos continuar a trabalhar no seu objetivo. Cada pequena escolha saudável de hoje aproxima-o da sua melhor versão.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-white/10 pointer-events-none blur-2xl" />
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Current Weight */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Peso Atual</span>
            <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">{currentWeight}</span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">Meta: {targetWeight} kg</span>
        </div>

        {/* Weight Lost */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Peso Eliminado</span>
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
              {lostKg > 0 ? `-${lostKg.toFixed(1)}` : '0.0'}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">Rumo à meta</span>
        </div>

        {/* % Goal Achieved */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Progresso do Alvo</span>
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100">{goalPercentage}%</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${goalPercentage}%` }} />
          </div>
        </div>

        {/* Remaining to Goal */}
        <div className="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Falta para a Meta</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">{remainingKg.toFixed(1)}</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 block">Próxima etapa</span>
        </div>
      </div>

      {/* 3. Today's Workout Focus & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout Card (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-200/60 dark:border-emerald-800">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Treino de Hoje</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">{todayPlan?.day || 'Hoje'} • {todayPlan?.title}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                Recomendado
              </span>
            </div>

            {todayWorkout ? (
              <div className="mt-4">
                <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">{todayWorkout.name}</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{todayWorkout.description}</p>

                <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-stone-300 mt-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <strong>{todayWorkout.duration_minutes} minutos</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <strong>~{todayWorkout.calories_burned_est} kcal</strong>
                  </span>
                  <span>•</span>
                  <span className="capitalize">{todayWorkout.level}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500 dark:text-stone-400">
                Hoje é dia de recuperação ativa ou descanso programado! Aproveite para caminhar e beber água.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onNavigate('workouts')}
              className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Ver todos os treinos
            </button>

            {todayWorkout && (
              <button
                id="btn-start-today-workout"
                type="button"
                onClick={() => onStartWorkout(todayWorkout)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-emerald-600/20"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Começar treino de hoje</span>
              </button>
            )}
          </div>
        </div>

        {/* Daily Tip & Quick Habits (1 col) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Tip of the Day */}
          <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-5 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs uppercase tracking-wide mb-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Dica Nutricional do Dia</span>
            </div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{tipOfDay.title}</h4>
            <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">{tipOfDay.text}</p>
          </div>

          {/* Quick Habits summary */}
          <HabitsTracker
            habits={habits.slice(0, 4)}
            onToggleHabit={handleToggleHabit}
            compact={true}
          />
        </div>
      </div>

      {/* 4. Calorie Tracker & Nutrition Section */}
      <CalorieTracker calorieTarget={user.target_calories || 2000} />

      {/* 5. Weight Trend Chart */}
      <WeightChart
        records={weightRecords}
        targetWeight={targetWeight}
        onAddRecord={handleAddWeight}
        onDeleteRecord={handleDeleteWeight}
      />
    </div>
  );
};
