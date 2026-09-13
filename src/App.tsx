import React, { useState, useEffect } from 'react';
import type { User, Workout } from './types.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { WorkoutRunner } from './components/WorkoutRunner.tsx';
import { AuthModal } from './views/AuthModal.tsx';
import { LandingPage } from './views/LandingPage.tsx';
import { OnboardingView } from './views/OnboardingView.tsx';
import { DashboardView } from './views/DashboardView.tsx';
import { WorkoutsView } from './views/WorkoutsView.tsx';
import { NutritionView } from './views/NutritionView.tsx';
import { ProgressView } from './views/ProgressView.tsx';
import { GoalsHabitsView } from './views/GoalsHabitsView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { AdminView } from './views/AdminView.tsx';
import { Flame } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeView, setActiveView] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'recovery'>('login');

  // Active workout execution
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Check existing session
  useEffect(() => {
    const initAuth = async () => {
      setLoadingUser(true);
      try {
        const token = api.getToken();
        if (token) {
          const res = await api.getCurrentUser();
          if (res?.user) {
            setUser(res.user);
            if (!res.user.onboarding_completed) {
              setActiveView('onboarding');
            } else {
              setActiveView('dashboard');
            }
          }
        }
      } catch (err) {
        console.warn('No active session or token expired.');
        api.clearToken();
      } finally {
        setLoadingUser(false);
      }
    };
    initAuth();
  }, []);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    if (!authenticatedUser.onboarding_completed) {
      setActiveView('onboarding');
    } else {
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setActiveView('landing');
    setMobileMenuOpen(false);
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setUser(updatedUser);
    setActiveView('dashboard');
  };

  const handleStartWorkout = (workout: Workout) => {
    setActiveWorkout(workout);
  };

  const handleFinishWorkout = async (summary: any) => {
    if (activeWorkout) {
      try {
        await api.logWorkout({
          workout_id: activeWorkout.id,
          workout_name: activeWorkout.name,
          duration_seconds: summary.duration_seconds,
          calories_burned: summary.calories_burned,
          exercises_completed: summary.exercises_completed,
          total_exercises: summary.total_exercises,
          total_sets: summary.total_sets,
        });
      } catch (err) {
        console.error('Failed to log completed workout:', err);
      }
    }
    setActiveWorkout(null);
  };

  const handleCancelWorkout = () => {
    setActiveWorkout(null);
  };

  const handleNavigate = (view: string) => {
    if (view === 'login') {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (view === 'register') {
      setAuthModalMode('register');
      setAuthModalOpen(true);
      return;
    }
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center transition-colors duration-200">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20 animate-bounce mb-3">
          <Flame className="w-6 h-6 fill-white" />
        </div>
        <p className="text-xs font-bold text-stone-500 dark:text-stone-400 tracking-wider uppercase">
          A carregar FitLean...
        </p>
      </div>
    );
  }

  // Active workout runner (full screen mode)
  if (activeWorkout) {
    return (
      <WorkoutRunner
        workout={activeWorkout}
        onFinish={handleFinishWorkout}
        onCancel={handleCancelWorkout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-950 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Top Global Navbar */}
      <Navbar
        user={user}
        activeView={activeView}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Main Layout Area */}
      {user ? (
        // Logged-in application layout with responsive sidebar
        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          {/* Desktop & Mobile Navigation */}
          {activeView !== 'onboarding' && (
            <Sidebar
              activeView={activeView}
              onNavigate={handleNavigate}
              user={user}
              mobileMenuOpen={mobileMenuOpen}
              onCloseMobileMenu={() => setMobileMenuOpen(false)}
            />
          )}

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
            {activeView === 'onboarding' && (
              <OnboardingView
                user={user}
                onComplete={handleOnboardingComplete}
              />
            )}

            {activeView === 'dashboard' && (
              <DashboardView
                user={user}
                onStartWorkout={handleStartWorkout}
                onNavigate={handleNavigate}
                onWeightUpdated={async () => {
                  const updated = await api.getCurrentUser();
                  if (updated?.user) setUser(updated.user);
                }}
              />
            )}

            {activeView === 'workouts' && (
              <WorkoutsView onStartWorkout={handleStartWorkout} />
            )}

            {activeView === 'nutrition' && (
              <NutritionView user={user} />
            )}

            {activeView === 'progress' && (
              <ProgressView user={user} />
            )}

            {activeView === 'goals' && (
              <GoalsHabitsView />
            )}

            {activeView === 'profile' && (
              <ProfileView
                user={user}
                onUserUpdated={(u) => setUser(u)}
                onLogout={handleLogout}
              />
            )}

            {activeView === 'admin' && user.role === 'admin' && (
              <AdminView />
            )}
          </main>
        </div>
      ) : (
        // Public Landing Page when logged out
        <main className="flex-1">
          <LandingPage
            onStart={() => {
              setAuthModalMode('register');
              setAuthModalOpen(true);
            }}
            onLogin={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
          />
        </main>
      )}

      {/* Authentication Modal */}
      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onSuccess={handleLoginSuccess}
          onCancel={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
