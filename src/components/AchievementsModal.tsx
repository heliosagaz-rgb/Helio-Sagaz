import React from 'react';
import type { Achievement } from '../types.ts';
import { Trophy, X, CheckCircle2, Lock, Sparkles, Flame, Dumbbell, Scale, Target } from 'lucide-react';

interface AchievementsModalProps {
  achievements: Achievement[];
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const percentage = achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0;
  const safePercentage = isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center text-2xl">
            🏆
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
              Suas Conquistas & Badges
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Celebre cada vitória conquistada com consistência
            </p>
          </div>
        </div>

        {/* Progress summary banner */}
        <div className="bg-stone-50 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-700/80 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200 mb-1.5">
            <span>{unlockedCount} de {achievements.length} conquistas desbloqueadas</span>
            <span className="text-emerald-600 dark:text-emerald-400">{safePercentage}%</span>
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${safePercentage}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 opacity-75'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  ach.unlocked
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700 shadow-xs'
                    : 'bg-stone-200 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-400 grayscale'
                }`}
              >
                {ach.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-black text-stone-900 dark:text-stone-100 truncate">
                    {ach.title}
                  </h4>
                  {ach.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3" />
                      Desbloqueado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full shrink-0">
                      <Lock className="w-3 h-3" />
                      Bloqueado
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                  {ach.description}
                </p>

                {ach.max_progress && ach.max_progress > 1 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] font-semibold text-stone-500 mb-0.5">
                      <span>Progresso</span>
                      <span>{ach.progress || 0} / {ach.max_progress}</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{
                          width: `${ach.max_progress && ach.max_progress > 0 ? Math.min(100, Math.max(0, Math.round(((ach.progress || 0) / ach.max_progress) * 100))) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-xs transition-colors"
          >
            Continuar focado
          </button>
        </div>
      </div>
    </div>
  );
};
