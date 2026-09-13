import React from 'react';
import type { User } from '../types.ts';
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  TrendingUp,
  Target,
  User as UserIcon,
  Shield,
  X,
  Flame,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  user,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const navItems = [
    { key: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { key: 'workouts', label: 'Treinos', icon: Dumbbell },
    { key: 'nutrition', label: 'Alimentação', icon: Apple },
    { key: 'progress', label: 'Progresso', icon: TrendingUp },
    { key: 'goals', label: 'Metas & Hábitos', icon: Target },
    { key: 'profile', label: 'Perfil', icon: UserIcon },
  ];

  if (user?.role === 'admin') {
    navItems.push({ key: 'admin', label: 'Admin', icon: Shield });
  }

  const handleItemClick = (key: string) => {
    onNavigate(key);
    onCloseMobileMenu();
  };

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-stone-900 border-r border-stone-200/80 dark:border-stone-800 min-h-[calc(100vh-61px)] p-4 flex-shrink-0 transition-colors duration-200">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                id={`sidebar-nav-${item.key}`}
                type="button"
                onClick={() => handleItemClick(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-100/80 dark:border-emerald-800/60'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Motivational Sidebar Card */}
        <div className="mt-auto pt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 dark:from-stone-800 dark:to-stone-900 text-white shadow-md relative overflow-hidden border border-stone-800 dark:border-stone-700/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-emerald-400">Consistência diária</span>
            </div>
            <p className="text-[11px] text-stone-300 dark:text-stone-300 leading-relaxed">
              Pequenos hábitos diários geram transformações definitivas no corpo e na mente.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-stone-900 h-full shadow-2xl p-5 flex flex-col z-10 animate-in slide-in-from-left duration-200 border-r border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-white" />
                </div>
                <span className="text-base font-black text-stone-900 dark:text-stone-100">
                  Fit<span className="text-emerald-600 dark:text-emerald-400">Lean</span>
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobileMenu}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5 mt-4 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleItemClick(item.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 shadow-xs border border-emerald-100/80 dark:border-emerald-800/60'
                        : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                );
              })}
            </nav>

            {user && (
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  {((user?.name || user?.email || 'U').trim().charAt(0) || 'U').toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{user?.name || user?.email?.split('@')[0] || 'Utilizador'}</p>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500 truncate">{user?.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (5 core items) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors duration-200">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl flex-1 transition-all ${
                isActive ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
