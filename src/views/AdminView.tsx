import React, { useState, useEffect } from 'react';
import type { AdminStats, User, Exercise, Workout, Food, Recipe } from '../types.ts';
import { api } from '../services/api.ts';
import { ExerciseVisualPlayer } from '../components/ExerciseVisualPlayer.tsx';
import {
  Shield,
  Users,
  Dumbbell,
  Apple,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Activity,
  CheckCircle2,
  X,
  Search,
  BookOpen
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metricas' | 'exercicios' | 'treinos' | 'alimentos' | 'utilizadores'>('metricas');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  // Exercise Create/Edit Modal state
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [exForm, setExForm] = useState({
    name: '',
    category: 'corpo_inteiro',
    difficulty: 'iniciante',
    equipment: 'nenhum',
    muscle_group: 'Pernas, Core',
    description: '',
    instructions: 'Posicione-se confortavelmente\nExecute com controle respiratório\nRetorne à posição inicial',
    sets: 3,
    reps: '12',
    rest_seconds: 45,
    calories_per_min: 8,
    image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
    animation_type: 'squat',
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sRes, uRes, eRes, wRes, fRes, rRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getExercises(),
        api.getWorkouts(),
        api.getFoods(),
        api.getRecipes(),
      ]);
      setStats(sRes);
      setUsers(uRes);
      setExercises(eRes);
      setWorkouts(wRes);
      setFoods(fRes);
      setRecipes(rRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleOpenNewExercise = () => {
    setEditingExercise(null);
    setExForm({
      name: '',
      category: 'corpo_inteiro',
      difficulty: 'iniciante',
      equipment: 'nenhum',
      muscle_group: 'Pernas, Core',
      description: '',
      instructions: 'Posicione-se confortavelmente\nExecute com controle respiratório\nRetorne à posição inicial',
      sets: 3,
      reps: '12',
      rest_seconds: 45,
      calories_per_min: 8,
      image_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80',
      animation_type: 'squat',
    });
    setShowExerciseModal(true);
  };

  const handleOpenEditExercise = (ex: Exercise) => {
    setEditingExercise(ex);
    setExForm({
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      equipment: ex.equipment,
      muscle_group: ex.muscle_group,
      description: ex.description,
      instructions: ex.instructions.join('\n'),
      sets: ex.sets,
      reps: ex.reps,
      rest_seconds: ex.rest_seconds,
      calories_per_min: ex.calories_per_min,
      image_url: ex.image_url,
      animation_type: ex.animation_type || 'squat',
    });
    setShowExerciseModal(true);
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Exercise> = {
        ...exForm,
        instructions: (exForm.instructions || '').split('\n').filter((s) => s.trim().length > 0),
      };

      if (editingExercise) {
        await api.adminUpdateExercise(editingExercise.id, payload);
      } else {
        await api.adminCreateExercise(payload);
      }
      setShowExerciseModal(false);
      const updated = await api.getExercises();
      setExercises(updated);
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err) {
      console.error('Failed saving exercise:', err);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Tem a certeza que deseja eliminar este exercício?')) return;
    try {
      await api.adminDeleteExercise(id);
      const updated = await api.getExercises();
      setExercises(updated);
      const s = await api.getAdminStats();
      setStats(s);
    } catch (err) {
      console.error('Failed deleting exercise:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-stone-900 dark:bg-stone-900 border border-stone-800 text-white rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Painel de Administração
              <span className="text-[10px] bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700">
                FitLean Admin
              </span>
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">Gestão de catálogo, utilizadores e métricas de desempenho</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNewExercise}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Exercício</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-2 flex items-center gap-2 shadow-xs overflow-x-auto text-xs font-bold transition-colors">
        {[
          { key: 'metricas', label: 'Métricas Globais', icon: TrendingUp },
          { key: 'exercicios', label: `Exercícios (${exercises.length})`, icon: Dumbbell },
          { key: 'treinos', label: `Treinos (${workouts.length})`, icon: Activity },
          { key: 'alimentos', label: `Alimentos (${foods.length})`, icon: Apple },
          { key: 'utilizadores', label: `Utilizadores (${users.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-2xl transition-all flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MÉTRICAS */}
      {activeTab === 'metricas' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Total Utilizadores</span>
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 block">{stats.total_users}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">Ativos na plataforma</span>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Ativos Hoje</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">{stats.active_users_today}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Acessos recentes</span>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Treinos Concluídos</span>
              <span className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-1 block">{stats.total_workouts_completed}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Histórico total</span>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Exercícios no Banco</span>
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 block">{stats.total_exercises}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Com animações ativas</span>
            </div>

            <div className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs transition-colors">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Alimentos & Receitas</span>
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1 block">{stats.total_foods + stats.total_recipes}</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 block">Base nutricional</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTÃO DE EXERCÍCIOS */}
      {activeTab === 'exercicios' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Catálogo de Exercícios ({exercises.length})</h3>
            <button
              type="button"
              onClick={handleOpenNewExercise}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 px-3 py-1.5 rounded-xl transition-colors border border-emerald-200/40 dark:border-emerald-800"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Exercício</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Exercício</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Nível</th>
                  <th className="pb-3">Equipamento</th>
                  <th className="pb-3">Séries / Reps</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {exercises.map((ex) => (
                  <tr key={ex.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2.5">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{ex.name}</div>
                      <div className="text-[11px] text-stone-400 dark:text-stone-500">{ex.muscle_group}</div>
                    </td>
                    <td className="py-2.5 capitalize text-stone-600 dark:text-stone-300">{ex.category.replace('_', ' ')}</td>
                    <td className="py-2.5 capitalize text-stone-600 dark:text-stone-300">{ex.difficulty}</td>
                    <td className="py-2.5 capitalize text-stone-600 dark:text-stone-300">{ex.equipment}</td>
                    <td className="py-2.5 font-semibold text-emerald-700 dark:text-emerald-400">{ex.sets} × {ex.reps}</td>
                    <td className="py-2.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditExercise(ex)}
                        className="text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 p-1"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExercise(ex.id)}
                        className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TREINOS */}
      {activeTab === 'treinos' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Programas de Treino Cadastrados ({workouts.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workouts.map((w) => (
              <div key={w.id} className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-200/40 dark:border-purple-800">
                    {w.category}
                  </span>
                  <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1.5">{w.name}</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{w.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 flex justify-between">
                  <span>{w.duration_minutes} min • {w.calories_burned_est} kcal</span>
                  <span>{w.exercise_ids.length} exercícios</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ALIMENTOS */}
      {activeTab === 'alimentos' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Base de Alimentos ({foods.length})</h3>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Nome</th>
                  <th className="pb-2">Porção</th>
                  <th className="pb-2">Calorias</th>
                  <th className="pb-2">Proteína</th>
                  <th className="pb-2">Carbs</th>
                  <th className="pb-2">Gorduras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {foods.map((f) => (
                  <tr key={f.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2 font-bold text-stone-900 dark:text-stone-100">{f.name}</td>
                    <td className="py-2 text-stone-500 dark:text-stone-400">{f.serving_size}</td>
                    <td className="py-2 font-semibold text-emerald-700 dark:text-emerald-400">{f.calories} kcal</td>
                    <td className="py-2 text-stone-700 dark:text-stone-300">{f.protein}g</td>
                    <td className="py-2 text-stone-700 dark:text-stone-300">{f.carbs}g</td>
                    <td className="py-2 text-stone-700 dark:text-stone-300">{f.fats}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: UTILIZADORES */}
      {activeTab === 'utilizadores' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Utilizadores Registados ({users.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Utilizador</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Objetivo</th>
                  <th className="pb-3">Nível</th>
                  <th className="pb-3">Data de Registo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2.5">
                      <div className="font-bold text-stone-900 dark:text-stone-100">{u.name}</div>
                      <div className="text-[11px] text-stone-400 dark:text-stone-500">{u.email}</div>
                    </td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 text-stone-600 dark:text-stone-300 capitalize">{u.goal?.replace(/_/g, ' ') || 'Não definido'}</td>
                    <td className="py-2.5 text-stone-600 dark:text-stone-300 capitalize">{u.fitness_level || 'Iniciante'}</td>
                    <td className="py-2.5 text-stone-400 dark:text-stone-500">{new Date(u.created_at).toLocaleDateString('pt-PT')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exercise Create/Edit Modal */}
      {showExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 my-8 animate-in zoom-in-95 duration-200 transition-colors">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
              </h3>
              <button
                type="button"
                onClick={() => setShowExerciseModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExercise} className="p-5 max-h-[75vh] overflow-y-auto space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Nome do Exercício *</label>
                <input
                  type="text"
                  required
                  value={exForm.name}
                  onChange={(e) => setExForm({ ...exForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Categoria</label>
                  <select
                    value={exForm.category}
                    onChange={(e) => setExForm({ ...exForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="corpo_inteiro">Corpo Inteiro</option>
                    <option value="pernas">Pernas</option>
                    <option value="gluteos">Glúteos</option>
                    <option value="abdomen">Abdómen</option>
                    <option value="peito">Peito</option>
                    <option value="costas">Costas</option>
                    <option value="ombros">Ombros</option>
                    <option value="bracos">Braços</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Dificuldade</label>
                  <select
                    value={exForm.difficulty}
                    onChange={(e) => setExForm({ ...exForm, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermédio</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Tipo de Animação SVG</label>
                  <select
                    value={exForm.animation_type}
                    onChange={(e) => setExForm({ ...exForm, animation_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="squat">Agachamento (Squat)</option>
                    <option value="pushup">Flexão de Braços (Pushup)</option>
                    <option value="jumping_jacks">Polichinelo (Jumping Jacks)</option>
                    <option value="plank">Prancha (Plank)</option>
                    <option value="glute_bridge">Ponte de Glúteos (Bridge)</option>
                    <option value="general">Geral / Corpo Inteiro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Equipamento</label>
                  <input
                    type="text"
                    value={exForm.equipment}
                    onChange={(e) => setExForm({ ...exForm, equipment: e.target.value })}
                    placeholder="nenhum, halteres..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Músculo Principal</label>
                <input
                  type="text"
                  value={exForm.muscle_group}
                  onChange={(e) => setExForm({ ...exForm, muscle_group: e.target.value })}
                  placeholder="Ex: Quadríceps, Glúteos"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Séries</label>
                  <input
                    type="number"
                    value={exForm.sets}
                    onChange={(e) => setExForm({ ...exForm, sets: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Repetições</label>
                  <input
                    type="text"
                    value={exForm.reps}
                    onChange={(e) => setExForm({ ...exForm, reps: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Descanso (s)</label>
                  <input
                    type="number"
                    value={exForm.rest_seconds}
                    onChange={(e) => setExForm({ ...exForm, rest_seconds: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">URL da Imagem / GIF</label>
                <input
                  type="url"
                  value={exForm.image_url}
                  onChange={(e) => setExForm({ ...exForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={exForm.description}
                  onChange={(e) => setExForm({ ...exForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">
                  Passo a passo (um por linha)
                </label>
                <textarea
                  rows={3}
                  value={exForm.instructions}
                  onChange={(e) => setExForm({ ...exForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowExerciseModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Guardar Exercício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
