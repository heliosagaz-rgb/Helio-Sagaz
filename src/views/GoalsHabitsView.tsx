import React, { useState, useEffect } from 'react';
import type { Goal } from '../types.ts';
import { api } from '../services/api.ts';
import { HabitsTracker } from '../components/HabitsTracker.tsx';
import {
  Target,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  Calendar,
  Sparkles,
  Trophy,
  X
} from 'lucide-react';

export const GoalsHabitsView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newUnit, setNewUnit] = useState('kg');
  const [newDeadline, setNewDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [gRes, hRes] = await Promise.all([
        api.getGoals(),
        api.getHabits(),
      ]);
      setGoals(gRes);
      setHabits(hRes);
    } catch (err) {
      console.error('Failed loading goals/habits:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleHabit = async (habitId: string) => {
    await api.toggleHabit(habitId);
    const updated = await api.getHabits();
    setHabits(updated);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTarget) return;
    setIsSubmitting(true);
    try {
      await api.createGoal({
        title: newTitle,
        target: parseFloat(newTarget),
        current: newCurrent ? parseFloat(newCurrent) : 0,
        unit: newUnit,
        deadline: newDeadline || undefined,
      });
      setShowAddGoalModal(false);
      setNewTitle('');
      setNewTarget('');
      setNewCurrent('');
      const updated = await api.getGoals();
      setGoals(updated);
    } catch (err) {
      console.error('Failed to create goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleGoalCompleted = async (goal: Goal) => {
    try {
      await api.updateGoal(goal.id, { completed: !goal.completed });
      const updated = await api.getGoals();
      setGoals(updated);
    } catch (err) {
      console.error('Failed to toggle goal:', err);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await api.deleteGoal(id);
      const updated = await api.getGoals();
      setGoals(updated);
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Daily Habits Section */}
      <HabitsTracker
        habits={habits}
        onToggleHabit={handleToggleHabit}
      />

      {/* 2. Structured Goals Section */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-7 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Metas e Conquistas</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Defina objetivos claros de curto e médio prazo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddGoalModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Meta</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((g) => {
            const currentNum = Number(g.current) || 0;
            const targetNum = Number(g.target);
            const validTarget = !isNaN(targetNum) && targetNum > 0 ? targetNum : 1;
            const rawPct = Math.round((currentNum / validTarget) * 100);
            const progressPct = isNaN(rawPct) ? 0 : Math.min(100, Math.max(0, rawPct));

            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border transition-all ${
                  g.completed
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300/70 dark:border-emerald-800'
                    : 'bg-stone-50/60 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleGoalCompleted(g)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-colors ${
                        g.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 hover:border-emerald-500'
                      }`}
                    >
                      {g.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <h4 className={`text-sm font-bold ${g.completed ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100'}`}>
                        {g.title}
                      </h4>
                      {g.deadline && (
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          Prazo: {g.deadline}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                        {g.current} / {g.target} {g.unit}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 block">{progressPct}% atingido</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors"
                      title="Eliminar meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      g.completed ? 'bg-emerald-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Adicionar Nova Meta</h3>
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Título da Meta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Perder 3 kg em 4 semanas"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Progresso Atual</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 0"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Alvo Final *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 3"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Unidade</label>
                  <input
                    type="text"
                    placeholder="Ex: kg, dias, km..."
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Data Limite (Prazo)</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'A guardar...' : 'Criar Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
