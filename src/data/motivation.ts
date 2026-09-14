import type { Achievement } from '../types.ts';

// ---------------- MOTIVATIONAL PHRASES ----------------
export interface MotivationalQuote {
  id: string;
  text: string;
  category: 'dashboard' | 'workout_pre' | 'workout_post' | 'streak' | 'progress' | 'habits';
  author?: string;
}

export const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  // Dashboard & General
  { id: 'q1', text: 'Hoje é mais um passo em direção ao seu objetivo.', category: 'dashboard' },
  { id: 'q2', text: 'Você não precisa ser perfeito. Precisa ser consistente.', category: 'dashboard' },
  { id: 'q3', text: 'O resultado começa com o treino de hoje.', category: 'dashboard' },
  { id: 'q4', text: 'Não pare agora. Você já começou.', category: 'dashboard' },
  { id: 'q5', text: 'Cada treino conta.', category: 'dashboard' },
  { id: 'q6', text: 'Você está mais perto do que estava ontem.', category: 'dashboard' },
  { id: 'q7', text: 'A consistência vence a motivação.', category: 'dashboard' },
  { id: 'q8', text: 'Não procure resultados rápidos. Construa resultados duradouros.', category: 'dashboard' },
  { id: 'q9', text: 'Seu futuro corpo agradece pelo treino de hoje.', category: 'dashboard' },
  { id: 'q10', text: 'Começar foi difícil. Continuar vai tornar tudo mais fácil.', category: 'dashboard' },
  { id: 'q11', text: 'Você não precisa de motivação todos os dias. Precisa de compromisso.', category: 'dashboard' },
  { id: 'q12', text: 'Pequenas escolhas diárias geram transformações extraordinárias.', category: 'dashboard' },
  { id: 'q13', text: 'A disciplina é a ponte entre os seus objetivos e a sua conquista.', category: 'dashboard' },
  { id: 'q14', text: 'O cansaço passa, mas o orgulho de não ter desistido fica.', category: 'dashboard' },

  // Pre-workout
  { id: 'pw1', text: 'Foco total no movimento. O treino de hoje constrói a sua força de amanhã.', category: 'workout_pre' },
  { id: 'pw2', text: 'Respire fundo, conecte-se ao seu objetivo e dê o seu melhor.', category: 'workout_pre' },
  { id: 'pw3', text: 'Menos desculpas, mais repetições. Vamos a isso!', category: 'workout_pre' },

  // Post-workout
  { id: 'po1', text: 'Missão cumprida! Cada gota de suor aproxima-o do corpo que deseja.', category: 'workout_post' },
  { id: 'po2', text: 'Você superou a preguiça e venceu mais um dia.', category: 'workout_post' },
  { id: 'po3', text: 'Excelente trabalho! Recupere bem e hidrate-se.', category: 'workout_post' },

  // Streak & consistency
  { id: 'st1', text: 'A sua sequência está viva! Mantenha a chama acesa.', category: 'streak' },
  { id: 'st2', text: 'A consistência diária é o segredo dos verdadeiros campeões.', category: 'streak' },

  // Progress
  { id: 'pr1', text: 'A balança é apenas um número; a sua energia e saúde são a verdadeira vitória.', category: 'progress' },
  { id: 'pr2', text: 'Celebre cada grama eliminada e cada centímetro conquistado.', category: 'progress' }
];

export function getRandomQuote(category: MotivationalQuote['category'] = 'dashboard'): string {
  const filtered = MOTIVATIONAL_QUOTES.filter(q => q.category === category);
  if (filtered.length === 0) return MOTIVATIONAL_QUOTES[0].text;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index].text;
}

export function getDailyQuote(): string {
  // Deterministic quote based on calendar day to avoid jarring flashes while refreshing
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const dashboardQuotes = MOTIVATIONAL_QUOTES.filter(q => q.category === 'dashboard');
  return dashboardQuotes[dayOfYear % dashboardQuotes.length].text;
}

// ---------------- BADGES / ACHIEVEMENTS ----------------
export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'streak' | 'weight' | 'goal';
  requirementType: 'workouts_count' | 'streak_days' | 'weight_lost' | 'goal_completed';
  threshold: number;
}

export const ACHIEVEMENTS_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_workout',
    title: 'Primeiro Treino',
    description: 'Completou o seu primeiro treino no FitLean com dedicação.',
    icon: '🏆',
    category: 'workout',
    requirementType: 'workouts_count',
    threshold: 1
  },
  {
    id: 'streak_3',
    title: '3 Dias Consecutivos',
    description: 'Manteve a consistência por 3 dias seguidos sem falhar.',
    icon: '🔥',
    category: 'streak',
    requirementType: 'streak_days',
    threshold: 3
  },
  {
    id: 'streak_7',
    title: '7 Dias Consecutivos',
    description: 'Uma semana completa de disciplina e hábitos saudáveis.',
    icon: '🔥',
    category: 'streak',
    requirementType: 'streak_days',
    threshold: 7
  },
  {
    id: 'workouts_10',
    title: '10 Treinos',
    description: 'Concluiu 10 treinos completos com sucesso.',
    icon: '💪',
    category: 'workout',
    requirementType: 'workouts_count',
    threshold: 10
  },
  {
    id: 'workouts_25',
    title: '25 Treinos',
    description: 'Alcançou o patamar de 25 treinos realizados.',
    icon: '🏋️',
    category: 'workout',
    requirementType: 'workouts_count',
    threshold: 25
  },
  {
    id: 'workouts_50',
    title: '50 Treinos',
    description: 'Máquina de consistência! 50 treinos no currículo.',
    icon: '⚡',
    category: 'workout',
    requirementType: 'workouts_count',
    threshold: 50
  },
  {
    id: 'first_goal',
    title: 'Primeiro Objetivo',
    description: 'Concluiu a primeira meta de saúde ou treino estipulada.',
    icon: '🎯',
    category: 'goal',
    requirementType: 'goal_completed',
    threshold: 1
  },
  {
    id: 'first_kg_lost',
    title: 'Primeiro kg Perdido',
    description: 'Eliminou o primeiro quilograma rumo ao peso pretendido.',
    icon: '⚖️',
    category: 'weight',
    requirementType: 'weight_lost',
    threshold: 1.0
  }
];

export function computeAchievements(stats: {
  completedWorkoutsCount: number;
  currentStreak: number;
  weightLostKg: number;
  goalsCompletedCount: number;
}): Achievement[] {
  return ACHIEVEMENTS_DEFINITIONS.map((def) => {
    let currentVal = 0;
    switch (def.requirementType) {
      case 'workouts_count':
        currentVal = stats.completedWorkoutsCount;
        break;
      case 'streak_days':
        currentVal = stats.currentStreak;
        break;
      case 'weight_lost':
        currentVal = stats.weightLostKg;
        break;
      case 'goal_completed':
        currentVal = stats.goalsCompletedCount;
        break;
    }

    const unlocked = currentVal >= def.threshold;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
      unlocked,
      progress: Math.min(currentVal, def.threshold),
      max_progress: def.threshold,
      unlocked_at: unlocked ? 'Conquistado' : undefined
    };
  });
}
