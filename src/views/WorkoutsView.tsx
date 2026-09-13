import React, { useState, useEffect } from 'react';
import type { Workout, Exercise, DayPlan } from '../types.ts';
import { api } from '../services/api.ts';
import { ExerciseCard } from '../components/ExerciseCard.tsx';
import { WeeklyPlanView } from '../components/WeeklyPlanView.tsx';
import {
  Dumbbell,
  Search,
  Filter,
  Play,
  Clock,
  Flame,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface WorkoutsViewProps {
  onStartWorkout: (workout: Workout) => void;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({ onStartWorkout }) => {
  const [activeTab, setActiveTab] = useState<'semanal' | 'programas' | 'exercicios'>('semanal');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [schedule, setSchedule] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Exercise filters
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [difficultyFilter, setDifficultyFilter] = useState('todas');
  const [equipmentFilter, setEquipmentFilter] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected workout detail modal
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<(Workout & { exercises: Exercise[] }) | null>(null);

  const loadWorkoutsData = async () => {
    setLoading(true);
    try {
      const [wRes, eRes, planRes] = await Promise.all([
        api.getWorkouts(),
        api.getExercises(),
        api.getRecommendedPlan().catch(() => ({ schedule: [] })),
      ]);
      setWorkouts(wRes);
      setExercises(eRes);
      if (planRes?.schedule) {
        setSchedule(planRes.schedule);
      }
    } catch (err) {
      console.error('Failed to load workouts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkoutsData();
  }, []);

  const handleOpenWorkoutDetail = async (w: Workout) => {
    try {
      const fullWorkout = await api.getWorkout(w.id);
      setSelectedWorkoutDetail(fullWorkout);
    } catch {
      setSelectedWorkoutDetail({
        ...w,
        exercises: exercises.filter((ex) => w.exercise_ids.includes(ex.id)),
      });
    }
  };

  const filteredExercises = exercises.filter((ex) => {
    const matchesCategory = categoryFilter === 'todas' || ex.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'todas' || ex.difficulty === difficultyFilter;
    const matchesEquip = equipmentFilter === 'todas' || ex.equipment === equipmentFilter;
    const matchesSearch = !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDiff && matchesEquip && matchesSearch;
  });

  const categories = [
    { id: 'todas', label: 'Todas as categorias' },
    { id: 'corpo_inteiro', label: 'Corpo Inteiro' },
    { id: 'pernas', label: 'Pernas' },
    { id: 'gluteos', label: 'Glúteos' },
    { id: 'abdomen', label: 'Abdómen' },
    { id: 'peito', label: 'Peito' },
    { id: 'costas', label: 'Costas' },
    { id: 'ombros', label: 'Ombros' },
    { id: 'bracos', label: 'Braços' },
    { id: 'cardio', label: 'Cardio' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation Tabs */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-2 sm:p-2.5 flex items-center gap-2 shadow-xs transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('semanal')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'semanal'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Plano Semanal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('programas')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'programas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Dumbbell className="w-4 h-4" />
          <span>Programas de Treino ({workouts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exercicios')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'exercicios'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Biblioteca de Exercícios ({exercises.length})</span>
        </button>
      </div>

      {/* TAB 1: PLANO SEMANAL */}
      {activeTab === 'semanal' && (
        <WeeklyPlanView
          schedule={schedule}
          workouts={workouts}
          onStartWorkout={onStartWorkout}
          onViewWorkoutDetail={handleOpenWorkoutDetail}
        />
      )}

      {/* TAB 2: PROGRAMAS DE TREINO */}
      {activeTab === 'programas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Programas de Treino Completos</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Treinos com volume balanceado e animações passo a passo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((w) => (
              <div
                key={w.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800 uppercase">
                      {w.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-stone-500 dark:text-stone-400 capitalize">
                      Nível: {w.level}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-2">{w.name}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{w.description}</p>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{w.duration_minutes} min</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>~{w.calories_burned_est} kcal</span>
                    </span>
                    <span>•</span>
                    <span>{w.exercise_ids.length} exercícios</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-50/70 dark:bg-stone-800/60 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleOpenWorkoutDetail(w)}
                    className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  >
                    Ver exercícios
                  </button>

                  <button
                    id={`btn-start-workout-${w.id}`}
                    type="button"
                    onClick={() => onStartWorkout(w)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Começar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BIBLIOTECA DE EXERCÍCIOS */}
      {activeTab === 'exercicios' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  id="input-search-exercise"
                  type="text"
                  placeholder="Pesquisar exercício por nome ou músculo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                />
              </div>

              {/* Difficulty filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 focus:outline-emerald-600"
              >
                <option value="todas">Todos os Níveis</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermédio</option>
                <option value="avancado">Avançado</option>
              </select>

              {/* Equipment filter */}
              <select
                value={equipmentFilter}
                onChange={(e) => setEquipmentFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-200 focus:outline-emerald-600"
              >
                <option value="todas">Qualquer Equipamento</option>
                <option value="nenhum">Sem equipamento (peso do corpo)</option>
                <option value="halteres">Halteres</option>
                <option value="elasticos">Elásticos</option>
              </select>
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === c.id
                      ? 'bg-emerald-600 text-white font-bold shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="py-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6">
              <Dumbbell className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">Nenhum exercício encontrado</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Tente remover os filtros ou pesquisar com outro termo.</p>
            </div>
          )}
        </div>
      )}

      {/* Selected Workout Detail Modal */}
      {selectedWorkoutDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 my-8">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {selectedWorkoutDetail.category}
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">{selectedWorkoutDetail.name}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{selectedWorkoutDetail.description}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedWorkoutDetail(null)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                Exercícios Incluídos ({selectedWorkoutDetail.exercises?.length || 0}):
              </h4>
              <div className="space-y-2">
                {selectedWorkoutDetail.exercises?.map((ex, idx) => (
                  <div key={ex.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center border border-emerald-300/40 dark:border-emerald-800">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">{ex.name}</span>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">{ex.muscle_group}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700">
                      {ex.sets} × {ex.reps}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedWorkoutDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={() => {
                  const w = selectedWorkoutDetail;
                  setSelectedWorkoutDetail(null);
                  onStartWorkout(w);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Começar Este Treino</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
