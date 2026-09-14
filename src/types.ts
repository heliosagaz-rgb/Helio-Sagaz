export type UserGoal = 'perder_peso' | 'reduzir_gordura' | 'melhorar_condicao' | 'habitos_saudaveis' | 'manter_peso' | string;
export type ExperienceLevel = 'iniciante' | 'intermediario' | 'avancado' | string;
export type TrainingLocation = 'casa' | 'ginasio' | 'ambos' | string;
export type EquipmentLevel = 'nenhum' | 'halteres' | 'elasticos' | 'maquinas' | 'completo' | string;
export type MuscleGroup = 'corpo_inteiro' | 'pernas' | 'gluteos' | 'abdomen' | 'peito' | 'costas' | 'ombros' | 'bracos' | 'cardio' | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | string;
  age?: number;
  gender?: 'masculino' | 'feminino' | 'outro' | string;
  height?: number; // in cm
  current_weight?: number; // in kg
  target_weight?: number; // in kg
  goal?: UserGoal;
  experience_level?: ExperienceLevel;
  fitness_level?: ExperienceLevel;
  training_location?: TrainingLocation;
  workout_location?: TrainingLocation;
  equipment?: EquipmentLevel;
  equipment_available?: EquipmentLevel;
  training_days?: number; // days per week
  days_per_week?: number;
  time_available?: number; // minutes
  workout_time_minutes?: number;
  target_calories?: number;
  units?: 'metric' | 'imperial';
  notifications_enabled?: boolean;
  onboarding_completed?: boolean;
  access_status?: 'active' | 'inactive' | 'expired' | 'pending_activation';
  activated_at?: string;
  subscription_end?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'workout' | 'streak' | 'weight' | 'goal';
  unlocked: boolean;
  unlocked_at?: string;
  progress?: number;
  max_progress?: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  muscle_group: string;
  difficulty: ExperienceLevel;
  equipment: EquipmentLevel;
  sets: number;
  reps: string;
  rest_seconds: number;
  description: string;
  instructions: string[];
  tips?: string[];
  calories_per_min?: number;
  image_url: string;
  gif_url?: string;
  video_url?: string;
  animation_type?: string;
}

export interface WorkoutExerciseItem {
  exercise_id: string;
  sets: number;
  reps: string;
  rest_seconds: number;
}

export interface Workout {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  difficulty?: ExperienceLevel;
  level?: string;
  duration_minutes: number;
  target_goal?: string;
  category: MuscleGroup;
  location?: TrainingLocation;
  calories_burned_est: number;
  exercise_ids: string[];
  exercises?: Exercise[];
}

export interface UserWorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  workout_name: string;
  date: string;
  duration_seconds: number;
  calories_burned: number;
  exercises_completed: number;
  total_exercises: number;
  total_sets: number;
}

export interface WeightRecord {
  id: string;
  user_id: string;
  weight: number;
  waist?: number;
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  type: 'frente' | 'lado' | 'costas';
  image_url: string;
  date: string;
  weight?: number;
  notes?: string;
}

export interface Food {
  id: string;
  name: string;
  category: 'proteina' | 'carboidrato' | 'vegetal' | 'fruta' | 'laticinio' | 'gordura_saudavel' | 'bebida' | 'snack' | string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Recipe {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  meal_type: 'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar' | string;
  prep_time?: string;
  prep_time_minutes?: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions: string[];
  image_url: string;
}

export interface FoodDiaryEntry {
  id: string;
  user_id: string;
  food_id?: string;
  food_name: string;
  meal_type: 'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar' | string;
  quantity_servings: number;
  portion_desc?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string; // YYYY-MM-DD
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  category?: 'peso' | 'treino' | 'agua' | 'habito' | 'geral' | string;
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  completed: boolean;
}

export interface HabitDefinition {
  id: string;
  name: string;
  icon: string;
  target_desc: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface DayPlan {
  day?: string;
  title?: string;
  dayName?: string;
  dayShort?: string;
  isRest?: boolean;
  is_rest?: boolean;
  workoutTitle?: string;
  workout_id?: string;
  workoutId?: string;
  durationMinutes?: number;
  focus?: string;
}

export interface AdminStats {
  total_users: number;
  active_users_today: number;
  total_workouts_completed: number;
  total_exercises: number;
  total_foods: number;
  total_recipes: number;
  popular_exercises?: { name: string; count: number }[];
  totalUsers?: number;
  activeUsers?: number;
  completedWorkouts?: number;
  totalExercises?: number;
  totalFoods?: number;
  totalRecipes?: number;
}

export interface EnrichedOwnerUser extends User {
  workoutsCount?: number;
  weightLogsCount?: number;
  habitsCompletedCount?: number;
  lastWorkoutDate?: string | null;
}

export interface OwnerTelemetrySummary {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  blockedUsers: number;
  onboardedUsers: number;
  newUsers24h: number;
  newUsers7d: number;
  newUsers30d: number;
  completedWorkouts: number;
  totalCaloriesBurned: number;
  completedHabitsCount: number;
  totalWeightLogs: number;
  totalMealsLogged: number;
}

export interface OwnerDailySignup {
  date: string;
  label: string;
  signups: number;
}

export interface OwnerRecentWorkout {
  id: string;
  user_id: string;
  userName: string;
  workout_name: string;
  duration_seconds: number;
  calories_burned: number;
  date: string;
}

export interface OwnerTelemetryData {
  success: boolean;
  masterKey: string;
  serverTime: string;
  summary: OwnerTelemetrySummary;
  dailySignups: OwnerDailySignup[];
  recentWorkouts: OwnerRecentWorkout[];
  users: EnrichedOwnerUser[];
}

