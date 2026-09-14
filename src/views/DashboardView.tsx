import React, { useState, useEffect } from 'react';
import type { User, Workout, WeightRecord, DayPlan } from '../types.ts';
import { api } from '../services/api.ts';
import { WeightChart } from '../components/WeightChart.tsx';
import { CalorieTracker } from '../components/CalorieTracker.tsx';
import { HabitsTracker } from '../components/HabitsTracker.tsx';
import { AchievementsModal } from '../components/AchievementsModal.tsx';
import { getDailyQuote, getRandomQuote, computeAchievements } from '../data/motivation.ts';
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
  Lightbulb,
  Trophy,
  RefreshCw,
  Award,
  Zap,
  Check
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
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [fallbackWorkout, setFallbackWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);

  // Motivational quote state
  const [currentQuote, setCurrentQuote] = useState<string>(getDailyQuote());

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: string } | null>(null);

  // Badges modal state
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  // Daily tips library
  const dailyTips = [
    { title: 'Hidratação Matinal', text: 'Beba 500ml de água logo ao acordar para ativar o metabolismo e a digestão.' },
    { title: 'Proteína nas Refeições', text: 'Incluir proteína magra em todas as refeições reduz a fome e preserva a massa muscular.' },
    { title: 'Sono Reparador', text: 'Dormir entre 7 e 8 horas regula os hormónios da saciedade (leptina e grelina).' },
    { title: 'Passos Diários', text: 'Uma caminhada leve de 15 minutos após as refeições melhora a sensibilidade à insulina.' },
  ];
  const tipOfDay = dailyTips[new Date().getDay() % dailyTips.length];

  const showToast = (text: string, icon = '🔥') => {
    setToastMessage({ text, icon });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [planRes, weightRes, habitsRes, historyRes, allWorkouts] = await Promise.all([
        api.getRecommendedPlan().catch(() => null),
        api.getWeightRecords().catch(() => []),
        api.getHabits().catch(() => []),
        api.getWorkoutHistory().catch(() => []),
        api.getWorkouts().catch(() => []),
      ]);

      if (planRes) setRecommendedPlan(planRes);
      if (allWorkouts && allWorkouts.length > 0) {
        setFallbackWorkout(allWorkouts[0]);
      }
      setWeightRecords(weightRes);
      setHabits(habitsRes);
      setWorkoutHistory(historyRes);
    } catch (err) {
      console.error('Failed loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleNextQuote = () => {
    const next = getRandomQuote('dashboard');
    setCurrentQuote(next);
  };

  const handleAddWeight = async (data: any) => {
    await api.logWeight(data);
    const updated = await api.getWeightRecords();
    setWeightRecords(updated);
    showToast('Peso registado com sucesso! Você está evoluindo.', '📉');
    if (onWeightUpdated) onWeightUpdated();
  };

  const handleDeleteWeight = async (id: string) => {
    await api.deleteWeight(id);
    const updated = await api.getWeightRecords();
    setWeightRecords(updated);
    if (onWeightUpdated) onWeightUpdated();
  };

  const handleToggleHabit = async (habitId: string) => {
    const target = habits.find(h => h.id === habitId);
    const wasCompleted = target ? target.completed : false;

    await api.toggleHabit(habitId);
    const updated = await api.getHabits();
    setHabits(updated);

    if (!wasCompleted) {
      showToast('Sequência aumentada! Hábito diário cumprido.', '🔥');
    }
  };

  // Progress Calculations (Guarded against NaN)
  const userCurrentWeightNum = Number(user.current_weight);
  const lastRecordWeight = weightRecords.length > 0 ? Number(weightRecords[weightRecords.length - 1].weight) : NaN;
  const currentWeight = !isNaN(userCurrentWeightNum) && userCurrentWeightNum > 0
    ? userCurrentWeightNum
    : !isNaN(lastRecordWeight) && lastRecordWeight > 0
    ? lastRecordWeight
    : 70;

  const userTargetWeightNum = Number(user.target_weight);
  const targetWeight = !isNaN(userTargetWeightNum) && userTargetWeightNum > 0 ? userTargetWeightNum : 62;

  const firstRecordWeight = weightRecords.length > 0 ? Number(weightRecords[0].weight) : NaN;
  const initialWeight = !isNaN(firstRecordWeight) && firstRecordWeight > 0 ? firstRecordWeight : currentWeight;

  const lostKgRaw = initialWeight - currentWeight;
  const lostKg = isNaN(lostKgRaw) || lostKgRaw < 0 ? 0 : lostKgRaw;

  const totalGoalToLoseRaw = initialWeight - targetWeight;
  const totalGoalToLose = isNaN(totalGoalToLoseRaw) || totalGoalToLoseRaw <= 0 ? 0.1 : totalGoalToLoseRaw;

  const goalPercentageRaw = Math.round((lostKg / totalGoalToLose) * 100);
  const goalPercentage = isNaN(goalPercentageRaw) ? 0 : Math.min(100, Math.max(0, goalPercentageRaw));

  const remainingKgRaw = currentWeight - targetWeight;
  const remainingKg = isNaN(remainingKgRaw) || remainingKgRaw < 0 ? 0 : remainingKgRaw;

  // Dynamic Streak Calculation
  const maxHabitStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streak), 0) : 0;
  const currentStreakDays = Math.max(maxHabitStreak, workoutHistory.length > 0 ? Math.min(workoutHistory.length, 7) : 3);

  // Compute Achievements dynamically
  const achievements = computeAchievements({
    completedWorkoutsCount: workoutHistory.length,
    currentStreak: currentStreakDays,
    weightLostKg: lostKg,
    goalsCompletedCount: goalPercentage >= 100 ? 1 : 0,
  });
  const unlockedAchievementsCount = achievements.filter(a => a.unlocked).length;

  const todayWorkout = recommendedPlan?.today?.workout;
  const todayPlan = recommendedPlan?.today?.plan;

  // Visual checkmarks for streak (e.g. 7 days or currentStreakDays)
  const streakDaysVisual = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-300 border border-stone-800 dark:border-stone-200">
          <span className="text-lg">{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Welcoming Header Banner with Dynamic Motivational Quote */}
      <div className="ios-glass-card rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-white/60 dark:border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ios-glass-pill text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Foco no seu objetivo diário</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            Olá, {user?.name || user?.email?.split('@')[0] || 'Atleta'} 👋
          </h1>

          {/* Dynamic Motivational Quote Display */}
          <div className="mt-3 flex items-start gap-2 ios-glass-subtle p-3.5 rounded-2xl border border-white/50 dark:border-white/10">
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-0.5">
                Motivação do Dia
              </span>
              <p className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-200 italic leading-relaxed">
                "{currentQuote}"
              </p>
            </div>
            <button
              type="button"
              onClick={handleNextQuote}
              className="p-1.5 rounded-xl hover:bg-white/40 dark:hover:bg-white/10 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
              title="Próxima frase motivacional"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 pointer-events-none blur-2xl" />
      </div>

      {/* 2. ÁREA "SUA JORNADA" (Conforme Especificação Estrita da Seção 7) */}
      <section className="ios-glass-card rounded-3xl border border-white/60 dark:border-white/10 p-5 sm:p-6 shadow-lg transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200/50 dark:border-white/10 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-stone-900 dark:text-stone-100">
                Sua Jornada
              </h2>
              <span className="ios-glass-pill text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                Evolução Contínua
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              A consistência diária é o segredo da sua transformação.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAchievementsOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl ios-glass-subtle border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/10 transition-colors cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Conquistas ({unlockedAchievementsCount}/{achievements.length})</span>
          </button>
        </div>

        {/* Journey 4 Core Metric Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          {/* 1. Sequência atual (Streak) */}
          <div className="ios-glass-subtle p-4 rounded-2xl border border-white/50 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Sequência Atual</span>
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-500" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 block">
                {currentStreakDays} dias consecutivos
              </span>
            </div>

            {/* Visual Checkmarks: ✓ ✓ ✓ ✓ ✓ ✓ ✓ */}
            <div className="mt-3 flex items-center gap-1.5">
              {streakDaysVisual.map((dayNum) => {
                const isChecked = dayNum <= Math.min(currentStreakDays, 7);
                return (
                  <div
                    key={dayNum}
                    title={`Dia ${dayNum}`}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                      isChecked
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                    }`}
                  >
                    {isChecked ? '✓' : dayNum}
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-2">
              🔥 Chama da disciplina acesa
            </span>
          </div>

          {/* 2. Treinos concluídos */}
          <div className="ios-glass-subtle p-4 rounded-2xl border border-white/50 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Treinos Concluídos</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Dumbbell className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 block">
                {workoutHistory.length} treinos concluídos
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
              {workoutHistory.length > 0
                ? 'Histórico ativo e consistente.'
                : 'Complete o seu primeiro treino hoje!'}
            </p>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold block mt-1">
              Volume total acumulado
            </span>
          </div>

          {/* 3. Peso perdido */}
          <div className="ios-glass-subtle p-4 rounded-2xl border border-white/50 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Peso Perdido</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 block">
                {lostKg > 0 ? `-${lostKg.toFixed(1)} kg` : '0.0 kg'}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
              Peso inicial: {initialWeight} kg → Atual: {currentWeight} kg
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block mt-1">
              {lostKg > 0 ? 'Progresso constante na balança' : 'Pronto para começar a queima'}
            </span>
          </div>

          {/* 4. Progresso do objetivo */}
          <div className="ios-glass-subtle p-4 rounded-2xl border border-white/50 dark:border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Progresso do Objetivo</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 block">
                {goalPercentage}% do objetivo
              </span>
            </div>

            <div className="w-full bg-stone-200/80 dark:bg-stone-700/60 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>

            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium block mt-2">
              Faltam {remainingKg.toFixed(1)} kg para o peso meta ({targetWeight} kg)
            </span>
          </div>
        </div>
      </section>

      {/* 3. Treino de Hoje & Dica Nutricional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Workout Card (2 cols) */}
        <div className="lg:col-span-2 ios-glass-card rounded-3xl border border-white/60 dark:border-white/10 p-5 sm:p-6 shadow-lg flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Treino de Hoje</h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">{todayPlan?.day || 'Hoje'} • {todayPlan?.title}</p>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 ios-glass-pill px-2.5 py-1 rounded-full border border-emerald-500/30">
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
            ) : fallbackWorkout ? (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                  <strong>Dia de Recuperação Ativa:</strong> O seu plano prevê descanso ou caminhada hoje. Mas se quiser manter o ritmo e queimar calorias, pode realizar este treino opcional:
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100">{fallbackWorkout.name}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{fallbackWorkout.description}</p>

                  <div className="flex items-center gap-4 text-xs text-stone-600 dark:text-stone-300 mt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <strong>{fallbackWorkout.duration_minutes} min</strong>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <strong>~{fallbackWorkout.calories_burned_est} kcal</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-stone-500 dark:text-stone-400">
                Hoje é dia de recuperação ativa ou descanso programado! Aproveite para caminhar e beber água.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/50 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onNavigate('workouts')}
              className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
            >
              Ver todos os treinos
            </button>

            {(todayWorkout || fallbackWorkout) && (
              <button
                id="btn-start-today-workout"
                type="button"
                onClick={() => onStartWorkout(todayWorkout || fallbackWorkout!)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{todayWorkout ? 'Começar treino de hoje' : 'Começar Treino Opcional'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Daily Tip & Quick Habits (1 col) */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Tip of the Day */}
          <div className="ios-glass-card border border-amber-500/20 rounded-3xl p-5 shadow-sm transition-colors">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wide mb-1.5">
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

      {/* Achievements Modal */}
      <AchievementsModal
        achievements={achievements}
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
      />
    </div>
  );
};
