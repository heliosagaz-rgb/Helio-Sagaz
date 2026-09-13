import React, { useState, useEffect } from 'react';
import type { Recipe, Food, User } from '../types.ts';
import { api } from '../services/api.ts';
import { CalorieTracker } from '../components/CalorieTracker.tsx';
import {
  Apple,
  Utensils,
  BookOpen,
  ArrowRight,
  Clock,
  Flame,
  CheckCircle2,
  Sparkles,
  Search,
  Filter,
  X
} from 'lucide-react';

interface NutritionViewProps {
  user: User;
}

export const NutritionView: React.FC<NutritionViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'diario' | 'receitas' | 'substituicoes' | 'alimentos'>('diario');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeCategory, setRecipeCategory] = useState('todas');
  const [searchFood, setSearchFood] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rRes, fRes] = await Promise.all([
          api.getRecipes(),
          api.getFoods(),
        ]);
        setRecipes(rRes);
        setFoods(fRes);
      } catch (err) {
        console.error('Failed loading nutrition data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const substitutions = [
    { from: 'Refrigerante açucarado', to: 'Água aromatizada com limão e hortelã', benefit: 'Economiza ~150 kcal e zero picos de insulina' },
    { from: 'Pão branco refinado', to: 'Pão 100% integral ou ovos mexidos', benefit: 'Mais fibras, maior saciedade e digestão lenta' },
    { from: 'Açúcar refinado no café', to: 'Canela em pó ou redução gradual', benefit: 'Sem calorias vazias e ação termogénica' },
    { from: 'Frituras em imersão de óleo', to: 'Forno ou Airfryer com fio de azeite', benefit: 'Redução de até 70% da gordura saturada' },
    { from: 'Molhos prontos para salada', to: 'Azeite extravirgem, limão e orégãos', benefit: 'Gorduras boas e sem conservantes químicos' },
    { from: 'Bolachas recheadas', to: 'Fruta fresca com aveia ou frutos secos', benefit: 'Densidade nutricional e energia estável' },
    { from: 'Batata frita', to: 'Batata-doce assada com alecrim', benefit: 'Menor índice glicémico e mais vitamina A' },
  ];

  const filteredRecipes = recipes.filter((r) => {
    if (recipeCategory === 'todas') return true;
    return r.meal_type === recipeCategory;
  });

  const filteredFoods = foods.filter((f) => {
    return !searchFood ||
      f.name.toLowerCase().includes(searchFood.toLowerCase()) ||
      f.category.toLowerCase().includes(searchFood.toLowerCase());
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Tabs */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-2 sm:p-2.5 flex items-center gap-2 shadow-xs overflow-x-auto transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('diario')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'diario'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Diário & Calorias</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('receitas')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'receitas'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Receitas ({recipes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('substituicoes')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'substituicoes'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Trocas Inteligentes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alimentos')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'alimentos'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Apple className="w-4 h-4" />
          <span>Tabela de Alimentos ({foods.length})</span>
        </button>
      </div>

      {/* TAB 1: DIÁRIO DE ALIMENTAÇÃO */}
      {activeTab === 'diario' && (
        <CalorieTracker calorieTarget={user.target_calories || 2000} />
      )}

      {/* TAB 2: RECEITAS SAUDÁVEIS */}
      {activeTab === 'receitas' && (
        <div className="space-y-5">
          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'todas', label: 'Todas as receitas' },
              { id: 'pequeno_almoco', label: 'Pequeno-almoço' },
              { id: 'almoco', label: 'Almoço' },
              { id: 'lanche', label: 'Lanches' },
              { id: 'jantar', label: 'Jantar' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setRecipeCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                  recipeCategory === cat.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-750'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                onClick={() => setSelectedRecipe(r)}
              >
                <div className="aspect-16/9 relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={r.image_url}
                    alt={r.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize">
                    {r.meal_type.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">{r.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{r.calories} kcal</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{r.prep_time_minutes} min</span>
                      </span>
                    </div>

                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Ver receita →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TROCAS INTELIGENTES */}
      {activeTab === 'substituicoes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs transition-colors">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Substituições Inteligentes</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Pequenas trocas simples no dia a dia que geram um défice calórico sustentável sem passar fome.
            </p>

            <div className="divide-y divide-stone-100 dark:divide-stone-800 mt-4">
              {substitutions.map((sub, idx) => (
                <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 border border-rose-200 dark:border-rose-900">
                      ✕
                    </span>
                    <span className="text-stone-700 dark:text-stone-400 line-through font-medium">{sub.from}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800">
                      {sub.to}
                    </span>
                  </div>

                  <span className="text-stone-500 dark:text-stone-400 italic sm:text-right pl-9 sm:pl-0">
                    💡 {sub.benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TABELA DE ALIMENTOS */}
      {activeTab === 'alimentos' && (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Banco de Alimentos Saudáveis</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Valores nutricionais por porção padrão</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar alimento..."
                value={searchFood}
                onChange={(e) => setSearchFood(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase text-[10px]">
                  <th className="pb-3">Alimento</th>
                  <th className="pb-3">Porção</th>
                  <th className="pb-3">Calorias</th>
                  <th className="pb-3">Proteína</th>
                  <th className="pb-3">Carboidratos</th>
                  <th className="pb-3">Gorduras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredFoods.map((f) => (
                  <tr key={f.id} className="hover:bg-stone-50/70 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="py-2.5 font-bold text-stone-900 dark:text-stone-100">{f.name}</td>
                    <td className="py-2.5 text-stone-500 dark:text-stone-400">{f.serving_size}</td>
                    <td className="py-2.5 font-bold text-emerald-700 dark:text-emerald-400">{f.calories} kcal</td>
                    <td className="py-2.5 text-stone-700 dark:text-stone-300">{f.protein}g</td>
                    <td className="py-2.5 text-stone-700 dark:text-stone-300">{f.carbs}g</td>
                    <td className="py-2.5 text-stone-700 dark:text-stone-300">{f.fats}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200 my-8">
            <div className="relative aspect-16/9 bg-stone-900">
              <img
                src={selectedRecipe.image_url}
                alt={selectedRecipe.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-3 right-3 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full uppercase border border-emerald-200/60 dark:border-emerald-800">
                  {selectedRecipe.meal_type.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-1.5">{selectedRecipe.title}</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{selectedRecipe.description}</p>
              </div>

              {/* Macros pills */}
              <div className="grid grid-cols-4 gap-2 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700 text-center">
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Calorias</span>
                  <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{selectedRecipe.calories}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Proteína</span>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{selectedRecipe.protein}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Carbs</span>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{selectedRecipe.carbs}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase">Gorduras</span>
                  <span className="text-sm font-bold text-stone-800 dark:text-stone-200">{selectedRecipe.fats}g</span>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-2">Ingredientes:</h4>
                <ul className="space-y-1.5">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <li key={i} className="text-xs text-stone-700 dark:text-stone-300 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparation */}
              <div>
                <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-2">Modo de Preparo:</h4>
                <ol className="space-y-2">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i} className="text-xs text-stone-700 dark:text-stone-300 flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0 border border-emerald-300/40 dark:border-emerald-800">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="p-4 bg-stone-50 dark:bg-stone-800/80 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
