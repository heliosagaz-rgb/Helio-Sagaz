import React from 'react';
import type { User } from '../types.ts';
import { useTheme } from '../context/ThemeContext.tsx';
import {
  Flame,
  User as UserIcon,
  LogOut,
  Shield,
  Dumbbell,
  Scale,
  Sparkles,
  Menu,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  activeView: string;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onNavigate,
  activeView,
  onOpenMobileMenu,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 px-4 sm:px-8 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                  Fit<span className="text-emerald-600 dark:text-emerald-400">Lean</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 px-1.5 py-0.5 rounded-md">
                  Pro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Quick navigation for non-logged-in landing */}
        {!user && (
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <a href="#como-funciona" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Como Funciona</a>
            <a href="#funcionalidades" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Funcionalidades</a>
            <a href="#exercicios" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Exercícios com Vídeo</a>
            <a href="#depoimentos" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Resultados</a>
          </nav>
        )}

        {/* Right: Dark Mode Toggle, User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark Mode Toggle Button */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
            className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700/80 border border-stone-200/80 dark:border-stone-700 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600 transition-transform duration-200 rotate-0" />
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Admin shortcut badge */}
              {user.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className={`hidden sm:flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-colors ${
                    activeView === 'admin'
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Painel Admin</span>
                </button>
              )}

              {/* User badge */}
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl hover:bg-stone-100 dark:hover:bg-stone-800 border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  {((user?.name || user?.email || 'U').trim().charAt(0) || 'U').toUpperCase()}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100 leading-none">{user?.name || user?.email?.split('@')[0] || 'Utilizador'}</div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-400 leading-none mt-1 capitalize">{user?.role || 'utilizador'}</div>
                </div>
              </button>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-2 rounded-xl text-stone-400 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Terminar sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-3 py-2 rounded-xl transition-colors"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 px-4 py-2 rounded-xl transition-colors shadow-xs hover:shadow-emerald-600/20"
              >
                Começar Agora
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

