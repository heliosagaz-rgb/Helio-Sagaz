import React from 'react';
import {
  Flame,
  CheckCircle2,
  Circle,
  Plus,
  Target,
  Sparkles,
  Award
} from 'lucide-react';

interface HabitItem {
  id: string;
  name: string;
  icon: string;
  target_desc: string;
  completed: boolean;
  streak: number;
}

interface HabitsTrackerProps {
  habits: HabitItem[];
  onToggleHabit: (habitId: string) => Promise<void>;
  compact?: boolean;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  habits,
  onToggleHabit,
  compact = false,
}) => {
  const completedCount = habits.filter((h) => h.completed).length;
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => Number(h.streak) || 0), 0) : 0;
  const habitPctRaw = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
  const habitPct = isNaN(habitPctRaw) ? 0 : Math.min(100, Math.max(0, habitPctRaw));

  return (
    <div className={`ios-glass-card rounded-3xl border border-white/60 dark:border-white/10 p-5 sm:p-6 shadow-lg transition-colors ${compact ? '' : 'space-y-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/50 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Flame className="w-4 h-4 fill-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Hábitos Diários</h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Mantenha a consistência todos os dias</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 ios-glass-pill text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 text-xs font-bold">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{maxStreak} dias de sequência</span>
        </div>
      </div>

      {/* Progress pill */}
      <div className="pt-2">
        <div className="flex justify-between text-xs font-semibold text-stone-600 dark:text-stone-300 mb-1.5">
          <span>{completedCount} de {habits.length} hábitos concluídos</span>
          <span>{habitPct}%</span>
        </div>
        <div className="w-full bg-stone-200/80 dark:bg-stone-700/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${habitPct}%` }}
          />
        </div>
      </div>

      {/* Habits list */}
      <div className="space-y-2 pt-2">
        {habits.map((h) => (
          <div
            key={h.id}
            id={`habit-item-${h.id}`}
            onClick={() => onToggleHabit(h.id)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
              h.completed
                ? 'bg-emerald-500/15 border-emerald-500/30 shadow-xs'
                : 'ios-glass-subtle border-white/50 dark:border-white/10 hover:border-emerald-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{h.icon}</span>
              <div>
                <span className={`text-xs font-bold block ${h.completed ? 'text-emerald-900 dark:text-emerald-300 line-through opacity-80' : 'text-stone-800 dark:text-stone-200'}`}>
                  {h.name}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400">{h.target_desc}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {h.streak > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  {h.streak}d
                </span>
              )}

              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                h.completed ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-300 dark:text-stone-600'
              }`}>
                {h.completed ? <CheckCircle2 className="w-6 h-6 fill-emerald-100 dark:fill-emerald-950 text-emerald-600 dark:text-emerald-400" /> : <Circle className="w-6 h-6 stroke-1.5" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
