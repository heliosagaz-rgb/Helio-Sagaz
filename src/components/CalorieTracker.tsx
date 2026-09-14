import React, { useState, useEffect } from 'react';
import type { FoodDiaryEntry, Food } from '../types.ts';
import { api } from '../services/api.ts';
import {
  Utensils,
  Plus,
  Trash2,
  Search,
  Check,
  Flame,
  PieChart,
  Calendar,
  X
} from 'lucide-react';

interface CalorieTrackerProps {
  calorieTarget?: number;
  initialDate?: string;
}

export const CalorieTracker: React.FC<CalorieTrackerProps> = ({
  calorieTarget = 2000,
  initialDate = new Date().toISOString().split('T')[0],
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [entries, setEntries] = useState<FoodDiaryEntry[]>([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });
  const [loading, setLoading] = useState(true);

  // Food Search Modal state
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [targetMealType, setTargetMealType] = useState<'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar'>('almoco');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [servings, setServings] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Custom manual food state
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCals, setCustomCals] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFats, setCustomFats] = useState('');

  const loadDiary = async (date: string) => {
    setLoading(true);
    try {
      const data = await api.getFoodDiary(date);
      setEntries(data.entries);
      setTotals(data.totals);
    } catch (err) {
      console.error('Failed to load food diary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiary(selectedDate);
  }, [selectedDate]);

  // Live Food Search
  useEffect(() => {
    if (!showSearchModal) return;
    const fetchFoods = async () => {
      setSearching(true);
      try {
        const foods = await api.getFoods({ search: searchQuery });
        setSearchResults(foods);
      } catch (err) {
        console.error('Failed searching foods:', err);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(fetchFoods, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery, showSearchModal]);

  const handleOpenAdd = (mealType: 'pequeno_almoco' | 'almoco' | 'lanche' | 'jantar') => {
    setTargetMealType(mealType);
    setSelectedFood(null);
    setServings(1);
    setSearchQuery('');
    setIsCustomMode(false);
    setShowSearchModal(true);
  };

  const handleAddFood = async () => {
    if (!selectedFood && !isCustomMode) return;
    setIsAdding(true);
    try {
      if (selectedFood) {
        const cals = Math.round(selectedFood.calories * servings);
        const prot = Math.round(selectedFood.protein * servings * 10) / 10;
        const carb = Math.round(selectedFood.carbs * servings * 10) / 10;
        const fat = Math.round(selectedFood.fats * servings * 10) / 10;

        await api.addFoodDiaryEntry({
          food_id: selectedFood.id,
          food_name: selectedFood.name,
          meal_type: targetMealType,
          quantity_servings: servings,
          portion_desc: `${servings}x (${selectedFood.serving_size})`,
          calories: cals,
          protein: prot,
          carbs: carb,
          fats: fat,
          date: selectedDate,
        });
      } else {
        // Custom food
        await api.addFoodDiaryEntry({
          food_name: customName.trim(),
          meal_type: targetMealType,
          quantity_servings: 1,
          portion_desc: 'Porção manual',
          calories: Number(customCals),
          protein: Number(customProtein) || 0,
          carbs: Number(customCarbs) || 0,
          fats: Number(customFats) || 0,
          date: selectedDate,
        });
      }

      setShowSearchModal(false);
      await loadDiary(selectedDate);
    } catch (err) {
      console.error('Failed to add food:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await api.deleteFoodDiaryEntry(id);
      await loadDiary(selectedDate);
    } catch (err) {
      console.error('Failed to delete food entry:', err);
    }
  };

  const targetCals = Number(calorieTarget) > 0 ? Number(calorieTarget) : 2000;
  const totalCals = Number(totals?.calories) || 0;
  const remainingCalories = Math.max(targetCals - totalCals, 0);
  const rawPercentage = Math.round((totalCals / targetCals) * 100);
  const percentage = isNaN(rawPercentage) ? 0 : Math.min(Math.max(0, rawPercentage), 100);

  const mealCategories = [
    { key: 'pequeno_almoco', label: 'Pequeno-almoço', icon: '☀️' },
    { key: 'almoco', label: 'Almoço', icon: '🥗' },
    { key: 'lanche', label: 'Lanches', icon: '🍎' },
    { key: 'jantar', label: 'Jantar', icon: '🍲' },
  ] as const;

  return (
    <div className="ios-glass-card rounded-3xl border border-white/60 dark:border-white/10 p-5 sm:p-7 shadow-lg space-y-6 transition-colors">
      {/* Header with Date Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/50 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Diário Alimentar e Calorias</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Registe as suas refeições diárias e controle os macronutrientes</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-stone-400 dark:text-stone-500" />
          <input
            id="input-food-diary-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl ios-glass-subtle border border-white/50 dark:border-white/10 text-xs font-semibold text-stone-700 dark:text-stone-300 focus:outline-emerald-600"
          />
        </div>
      </div>

      {/* Main Calorie Summary Card */}
      <div className="ios-glass-card rounded-2xl p-5 sm:p-6 shadow-md space-y-4 border border-white/60 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Balanço Energético de Hoje
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white">{totals.calories}</span>
              <span className="text-stone-500 dark:text-stone-400 text-sm">/ {calorieTarget} kcal</span>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-stone-500 dark:text-stone-400 block">Restante para a meta</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {remainingCalories} kcal
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-stone-200/80 dark:bg-stone-800/80 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totals.calories > calorieTarget ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400 font-medium">
            <span>{percentage}% da meta consumida</span>
            <span>Meta: {calorieTarget} kcal</span>
          </div>
        </div>

        {/* Macronutrients Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-stone-200/50 dark:border-white/10">
          <div className="ios-glass-subtle p-2.5 rounded-xl text-center border border-white/40 dark:border-white/10">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Proteína</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totals.protein}g</span>
          </div>
          <div className="ios-glass-subtle p-2.5 rounded-xl text-center border border-white/40 dark:border-white/10">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Carboidratos</span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{totals.carbs}g</span>
          </div>
          <div className="ios-glass-subtle p-2.5 rounded-xl text-center border border-white/40 dark:border-white/10">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Gorduras</span>
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{totals.fats}g</span>
          </div>
        </div>
      </div>

      {/* Meal Slots List */}
      <div className="space-y-4">
        {mealCategories.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal_type === meal.key);
          const mealCals = mealEntries.reduce((acc, curr) => acc + curr.calories, 0);

          return (
            <div
              key={meal.key}
              className="ios-glass-subtle border border-white/50 dark:border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-colors"
            >
              {/* Meal header */}
              <div className="bg-white/30 dark:bg-white/5 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meal.icon}</span>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{meal.label}</span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                    ({mealCals} kcal)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAdd(meal.key)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 bg-white dark:bg-stone-800 hover:bg-emerald-50 dark:hover:bg-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Meal item rows */}
              {mealEntries.length > 0 ? (
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {mealEntries.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 block">{item.food_name}</span>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">
                          {item.portion_desc} • {item.protein}g prot • {item.carbs}g carb • {item.fats}g gord
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-stone-900 dark:text-stone-100">{item.calories} kcal</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(item.id)}
                          className="text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-md transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-center text-xs text-stone-400 dark:text-stone-500">
                  Nenhum alimento registado nesta refeição.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Adicionar ao {mealCategories.find((m) => m.key === targetMealType)?.label}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Escolha da base de alimentos ou adicione manualmente</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-5 pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  !isCustomMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                Pesquisar Alimentos (30+)
              </button>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                  isCustomMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                Personalizado
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {!isCustomMode ? (
                <>
                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      id="search-food-input"
                      type="text"
                      placeholder="Pesquisar alimento (ex: frango, ovo, aveia, banana...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-emerald-600"
                    />
                  </div>

                  {/* Results List */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {searchResults.map((f) => {
                      const isSelected = selectedFood?.id === f.id;
                      return (
                        <div
                          key={f.id}
                          onClick={() => setSelectedFood(f)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-800/80'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-stone-900 dark:text-stone-100 block">{f.name}</span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                              {f.serving_size} • {f.calories} kcal • {f.protein}g prot
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                        </div>
                      );
                    })}
                    {searchResults.length === 0 && !searching && (
                      <p className="text-center text-xs text-stone-400 dark:text-stone-500 py-4">Nenhum alimento encontrado com esse nome.</p>
                    )}
                  </div>

                  {/* Selected Food Portion */}
                  {selectedFood && (
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Quantidade de porções:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0.25"
                            step="0.25"
                            value={servings}
                            onChange={(e) => setServings(Math.max(0.1, parseFloat(e.target.value) || 1))}
                            className="w-16 px-2 py-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg text-xs text-center font-bold text-stone-900 dark:text-stone-100"
                          />
                          <span className="text-xs text-stone-500 dark:text-stone-400">porção(ões)</span>
                        </div>
                      </div>
                      <div className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold text-right">
                        Total calculado: {Math.round((Number(selectedFood.calories) || 0) * (Number(servings) || 1))} kcal
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Custom Manual Food Form */
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">Nome do alimento *</label>
                    <input
                      type="text"
                      placeholder="Ex: Iogurte caseiro especial"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">Calorias (kcal) *</label>
                      <input
                        type="number"
                        placeholder="Ex: 180"
                        value={customCals}
                        onChange={(e) => setCustomCals(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">Proteína (g)</label>
                      <input
                        type="number"
                        placeholder="Ex: 15"
                        value={customProtein}
                        onChange={(e) => setCustomProtein(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">Carboidratos (g)</label>
                      <input
                        type="number"
                        placeholder="Ex: 20"
                        value={customCarbs}
                        onChange={(e) => setCustomCarbs(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 block mb-1">Gorduras (g)</label>
                      <input
                        type="number"
                        placeholder="Ex: 5"
                        value={customFats}
                        onChange={(e) => setCustomFats(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                Cancelar
              </button>
              <button
                id="btn-confirm-add-food"
                type="button"
                disabled={isAdding || (!selectedFood && (!customName || !customCals))}
                onClick={handleAddFood}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
              >
                {isAdding ? 'A adicionar...' : 'Adicionar ao Diário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
