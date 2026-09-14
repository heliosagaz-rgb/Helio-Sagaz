import type {
  User,
  Exercise,
  Workout,
  Food,
  Recipe,
  UserWorkoutLog,
  WeightRecord,
  ProgressPhoto,
  FoodDiaryEntry,
  Goal,
  DayPlan,
  AdminStats,
  OwnerTelemetryData,
  EnrichedOwnerUser
} from '../types.ts';

const TOKEN_KEY = 'fitlean_token';
const USER_KEY = 'fitlean_user';

// In-memory fallback if localStorage is blocked/disabled on mobile Safari
const memoryStore: Record<string, string> = {};

export const authStorage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY) || memoryStore[TOKEN_KEY] || null;
    } catch {
      return memoryStore[TOKEN_KEY] || null;
    }
  },
  setToken(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
    memoryStore[TOKEN_KEY] = token;
  },
  removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
    delete memoryStore[TOKEN_KEY];
    delete memoryStore[USER_KEY];
  },
  getCachedUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY) || memoryStore[USER_KEY];
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setCachedUser(user: User) {
    try {
      const serialized = JSON.stringify(user);
      localStorage.setItem(USER_KEY, serialized);
      memoryStore[USER_KEY] = serialized;
    } catch {
      memoryStore[USER_KEY] = JSON.stringify(user);
    }
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If unauthorized or token invalid, clean up stale credentials
    if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/owner/verify-key')) {
      authStorage.removeToken();
    }
    throw new Error(data.error || 'Ocorreu um erro no pedido.');
  }

  return data as T;
}

export const api = {
  // Auth
  async register(body: { name: string; email: string; password: string; confirmPassword?: string }) {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    authStorage.setToken(res.token);
    authStorage.setCachedUser(res.user);
    return res;
  },

  async login(body: { email: string; password: string }) {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    authStorage.setToken(res.token);
    authStorage.setCachedUser(res.user);
    return res;
  },

  async activateAccount(body: { email: string; code?: string; name?: string; password?: string }) {
    const res = await request<{ message: string; token: string; user: User }>('/api/auth/activate', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    authStorage.setToken(res.token);
    authStorage.setCachedUser(res.user);
    return res;
  },

  getToken(): string | null {
    return authStorage.getToken();
  },

  clearToken() {
    authStorage.removeToken();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return this.getMe();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await request<{ user: User }>('/api/auth/me');
    authStorage.setCachedUser(res.user);
    return res;
  },

  logout() {
    authStorage.removeToken();
  },

  async forgotPassword(email: string) {
    return request<{ message: string; resetCode?: string; email: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(body: { email: string; code: string; newPassword: string }) {
    return request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateProfile(updates: Partial<User>) {
    const res = await request<{ message: string; user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    authStorage.setCachedUser(res.user);
    return res;
  },

  async changePassword(body: { currentPassword: string; newPassword: string }) {
    return request<{ message: string }>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  // Onboarding
  async submitOnboarding(data: Partial<User>) {
    const res = await request<{ message: string; user: User }>('/api/user/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    authStorage.setCachedUser(res.user);
    return res;
  },

  // Plan
  async getRecommendedPlan() {
    return request<{
      schedule: DayPlan[];
      today: { plan: DayPlan; workout: Workout };
      recommendationSummary: any;
    }>('/api/user/plan');
  },

  // Exercises & Workouts
  async getExercises(params?: { category?: string; difficulty?: string; equipment?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.difficulty) query.append('difficulty', params.difficulty);
    if (params?.equipment) query.append('equipment', params.equipment);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Exercise[]>(`/api/exercises${qs}`);
  },

  async getExercise(id: string) {
    return request<Exercise>(`/api/exercises/${id}`);
  },

  async getWorkouts() {
    return request<Workout[]>('/api/workouts');
  },

  async getWorkout(id: string) {
    return request<Workout & { exercises: Exercise[] }>(`/api/workouts/${id}`);
  },

  async getUserWorkouts() {
    return request<UserWorkoutLog[]>('/api/user/workouts');
  },

  async getWorkoutHistory() {
    return this.getUserWorkouts();
  },

  async logCompletedWorkout(data: {
    workout_id: string;
    workout_name: string;
    duration_seconds: number;
    calories_burned: number;
    exercises_completed: number;
    total_exercises: number;
    total_sets: number;
  }) {
    return request<{ message: string; log: UserWorkoutLog }>('/api/user/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logWorkout(data: {
    workout_id: string;
    workout_name: string;
    duration_seconds: number;
    calories_burned: number;
    exercises_completed: number;
    total_exercises: number;
    total_sets: number;
  }) {
    return this.logCompletedWorkout(data);
  },

  // Weight & Progress
  async getWeightRecords() {
    return request<WeightRecord[]>('/api/user/weight');
  },

  async logWeight(data: { weight: number; waist?: number; notes?: string; date?: string }) {
    return request<{ message: string; record: WeightRecord }>('/api/user/weight', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteWeight(id: string) {
    return request<{ message: string }>(`/api/user/weight/${id}`, {
      method: 'DELETE',
    });
  },

  async getProgressPhotos() {
    return request<ProgressPhoto[]>('/api/user/photos');
  },

  async uploadProgressPhoto(data: { type: 'frente' | 'lado' | 'costas'; image_url: string; notes?: string; weight?: number; date?: string }) {
    return request<{ message: string; photo: ProgressPhoto }>('/api/user/photos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteProgressPhoto(id: string) {
    return request<{ message: string }>(`/api/user/photos/${id}`, {
      method: 'DELETE',
    });
  },

  // Nutrition
  async getFoods(params?: { search?: string; category?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Food[]>(`/api/foods${qs}`);
  },

  async getRecipes(params?: { meal_type?: string }) {
    const query = new URLSearchParams();
    if (params?.meal_type) query.append('meal_type', params.meal_type);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<Recipe[]>(`/api/recipes${qs}`);
  },

  async getFoodDiary(date?: string) {
    const qs = date ? `?date=${date}` : '';
    return request<{
      date: string;
      entries: FoodDiaryEntry[];
      totals: { calories: number; protein: number; carbs: number; fats: number };
    }>(`/api/user/food-diary${qs}`);
  },

  async addFoodDiaryEntry(data: {
    food_id?: string;
    food_name: string;
    meal_type: 'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar';
    quantity_servings: number;
    portion_desc: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    date?: string;
  }) {
    return request<{ message: string; entry: FoodDiaryEntry }>('/api/user/food-diary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteFoodDiaryEntry(id: string) {
    return request<{ message: string }>(`/api/user/food-diary/${id}`, {
      method: 'DELETE',
    });
  },

  // Goals
  async getGoals() {
    return request<Goal[]>('/api/user/goals');
  },

  async createGoal(data: { title: string; category?: string; target: number; current?: number; unit?: string; deadline?: string }) {
    return request<{ message: string; goal: Goal }>('/api/user/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGoal(id: string, updates: Partial<Goal>) {
    return request<{ message: string; goal: Goal }>(`/api/user/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteGoal(id: string) {
    return request<{ message: string }>(`/api/user/goals/${id}`, {
      method: 'DELETE',
    });
  },

  // Habits
  async getHabits(date?: string) {
    const qs = date ? `?date=${date}` : '';
    return request<{ id: string; name: string; icon: string; target_desc: string; completed: boolean; streak: number }[]>(`/api/user/habits${qs}`);
  },

  async toggleHabit(habit_id: string, date?: string) {
    return request<{ habit_id: string; date: string; completed: boolean }>('/api/user/habits/toggle', {
      method: 'POST',
      body: JSON.stringify({ habit_id, date }),
    });
  },

  // Admin
  async getAdminStats() {
    return request<AdminStats>('/api/admin/stats');
  },

  async getAdminUsers() {
    return request<User[]>('/api/admin/users');
  },

  async adminCreateExercise(data: Partial<Exercise>) {
    return request<{ message: string; exercise: Exercise }>('/api/admin/exercises', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateExercise(id: string, data: Partial<Exercise>) {
    return request<{ message: string; exercise: Exercise }>(`/api/admin/exercises/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteExercise(id: string) {
    return request<{ message: string }>(`/api/admin/exercises/${id}`, {
      method: 'DELETE',
    });
  },

  async adminCreateWorkout(data: Partial<Workout>) {
    return request<{ message: string; workout: Workout }>('/api/admin/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateWorkout(id: string, data: Partial<Workout>) {
    return request<{ message: string; workout: Workout }>(`/api/admin/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteWorkout(id: string) {
    return request<{ message: string }>(`/api/admin/workouts/${id}`, {
      method: 'DELETE',
    });
  },

  async adminCreateFood(data: Partial<Food>) {
    return request<{ message: string; food: Food }>('/api/admin/foods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateFood(id: string, data: Partial<Food>) {
    return request<{ message: string; food: Food }>(`/api/admin/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteFood(id: string) {
    return request<{ message: string }>(`/api/admin/foods/${id}`, {
      method: 'DELETE',
    });
  },

  async adminCreateRecipe(data: Partial<Recipe>) {
    return request<{ message: string; recipe: Recipe }>('/api/admin/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async adminUpdateRecipe(id: string, data: Partial<Recipe>) {
    return request<{ message: string; recipe: Recipe }>(`/api/admin/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async adminDeleteRecipe(id: string) {
    return request<{ message: string }>(`/api/admin/recipes/${id}`, {
      method: 'DELETE',
    });
  },

  // Owner Private Telemetry & Master Control
  async verifyOwnerKey(key: string) {
    return request<{ success: boolean; message: string }>('/api/owner/verify-key', {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
  },

  async getOwnerTelemetry(key?: string) {
    const query = key ? `?key=${encodeURIComponent(key)}` : '';
    const headers = key ? { 'x-owner-key': key } : undefined;
    return request<OwnerTelemetryData>(`/api/owner/telemetry${query}`, {
      headers,
    });
  },

  async updateUserStatusByOwner(userId: string, updates: { status?: string; role?: string }, key?: string) {
    const query = key ? `?key=${encodeURIComponent(key)}` : '';
    const headers = key ? { 'x-owner-key': key } : undefined;
    return request<{ message: string; user: User | null }>(`/api/owner/users/${userId}/status${query}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(updates),
    });
  },

  async resetUserPasswordByOwner(userId: string, newPassword?: string, key?: string) {
    const query = key ? `?key=${encodeURIComponent(key)}` : '';
    const headers = key ? { 'x-owner-key': key } : undefined;
    return request<{ message: string; temporaryPassword: string }>(`/api/owner/users/${userId}/reset-password${query}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ newPassword }),
    });
  }
};
