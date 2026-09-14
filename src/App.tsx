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
import { AccessBlockedView } from './views/AccessBlockedView.tsx';
import { OwnerTrackingView } from './views/OwnerTrackingView.tsx';
import { Flame } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeView, setActiveView] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | 'recovery' | 'activate'>('login');

  // Active workout execution
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Check initial URL routes for owner tracking link
  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (
        hash.includes('owner-tracking') ||
        search.includes('owner-tracking') ||
        hash.includes('key=') ||
        search.includes('key=')
      ) {
        setActiveView('owner-tracking');
        return true;
      }
      return false;
    };

    const isOwner = checkRoute();
    window.addEventListener('hashchange', checkRoute);

    // Check existing session
    const initAuth = async () => {
      setLoadingUser(true);
      try {
        const token = api.getToken();
        if (token) {
          const res = await api.getCurrentUser();
          if (res?.user) {
            setUser(res.user);
            if (!isOwner && !window.location.hash.includes('owner-tracking')) {
              if (!res.user.onboarding_completed) {
                setActiveView('onboarding');
              } else {
                setActiveView('dashboard');
              }
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

    return () => {
      window.removeEventListener('hashchange', checkRoute);
    };
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
    if (view === 'activate') {
      setAuthModalMode('activate');
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
        workout={activeWorkout as any}
        onClose={handleCancelWorkout}
        onWorkoutCompleted={async () => {
          const res = await api.getCurrentUser().catch(() => null);
          if (res?.user) setUser(res.user);
        }}
        onViewProgress={() => {
          setActiveWorkout(null);
          setActiveView('progress');
        }}
        userName={user?.name || user?.email?.split('@')[0] || 'Atleta'}
      />
    );
  }

  // Owner Telemetry Dashboard (accessible via secret link or navbar/sidebar)
  if (activeView === 'owner-tracking') {
    return (
      <OwnerTrackingView
        currentUser={user}
        onNavigateBack={() => {
          if (window.location.hash.includes('owner-tracking')) {
            window.location.hash = '';
          }
          setActiveView(user ? 'dashboard' : 'landing');
        }}
      />
    );
  }

  // Check if user has active access
  const isAccessBlocked =
    user &&
    user.role !== 'admin' &&
    user.access_status &&
    user.access_status !== 'active';

  return (
    <div className="relative min-h-screen bg-stone-100/60 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col selection:bg-emerald-200 selection:text-emerald-900 dark:selection:bg-emerald-950 dark:selection:text-emerald-200 transition-colors duration-300 overflow-x-hidden">
      {/* iOS 26 Liquid Glass Ambient Atmospheric Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/25 dark:bg-emerald-500/15 rounded-full blur-[110px] animate-pulse" />
        <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/4 w-[34rem] h-[34rem] bg-cyan-400/20 dark:bg-emerald-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-indigo-400/15 dark:bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Global Navbar */}
      <Navbar
        user={user}
        activeView={isAccessBlocked ? 'blocked' : activeView}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* Access Blocked Screen */}
      {isAccessBlocked ? (
        <main className="flex-1">
          <AccessBlockedView
            user={user}
            onLogout={handleLogout}
            onOpenActivate={() => {
              setAuthModalMode('activate');
              setAuthModalOpen(true);
            }}
          />
        </main>
      ) : user ? (
        // Logged-in application layout with responsive sidebar
        <div className="flex-1 flex max-w-7xl mx-auto w-full p-2 sm:p-4 gap-4">
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
          <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto max-w-full">
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
              setAuthModalMode('activate');
              setAuthModalOpen(true);
            }}
            onLogin={() => {
              setAuthModalMode('login');
              setAuthModalOpen(true);
            }}
            onActivate={() => {
              setAuthModalMode('activate');
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
