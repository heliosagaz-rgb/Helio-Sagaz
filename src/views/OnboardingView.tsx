import React, { useState } from 'react';
import type { User } from '../types.ts';
import { api } from '../services/api.ts';
import {
  Flame,
  ArrowRight,
  ArrowLeft,
  Check,
  Dumbbell,
  Target,
  Home,
  Building,
  Clock,
  Calendar,
  Sparkles,
  Droplets,
  Scale
} from 'lucide-react';

interface OnboardingViewProps {
  user: User;
  onComplete: (updatedUser: User) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Step 1: Basic data
  const [age, setAge] = useState(user.age ? String(user.age) : '28');
  const [gender, setGender] = useState<'feminino' | 'masculino' | 'outro'>(user.gender || 'feminino');
  const [height, setHeight] = useState(user.height ? String(user.height) : '165');
  const [currentWeight, setCurrentWeight] = useState(user.current_weight ? String(user.current_weight) : '74.5');
  const [targetWeight, setTargetWeight] = useState(user.target_weight ? String(user.target_weight) : '65');

  // Step 2: Goal
  const [goal, setGoal] = useState(user.goal || 'emagrecer_saudavel');

  // Step 3: Fitness level
  const [fitnessLevel, setFitnessLevel] = useState(user.fitness_level || 'iniciante');

  // Step 4: Workout location
  const [workoutLocation, setWorkoutLocation] = useState(user.workout_location || 'casa');

  // Step 5: Equipment
  const [equipment, setEquipment] = useState(user.equipment_available || 'nenhum');

  // Step 6: Frequency & Time
  const [daysPerWeek, setDaysPerWeek] = useState<number>(user.days_per_week || 4);
  const [workoutTimeMins, setWorkoutTimeMins] = useState<number>(user.workout_time_minutes || 30);

  // Submission state & generated summary
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const calculateTargetTimeWeeks = () => {
    const diff = Math.max(0, parseFloat(currentWeight) - parseFloat(targetWeight));
    // Safe healthy rate: 0.5kg to 0.7kg per week
    return Math.max(2, Math.round(diff / 0.6));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      handleFinalize();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleFinalize = async () => {
    setIsGenerating(true);
    try {
      const payload: Partial<User> = {
        name: user.name || '',
        age: parseInt(age) || 28,
        gender,
        height: parseFloat(height) || 165,
        current_weight: parseFloat(currentWeight) || 70,
        target_weight: parseFloat(targetWeight) || 62,
        goal,
        fitness_level: fitnessLevel as any,
        workout_location: workoutLocation as any,
        equipment_available: equipment as any,
        days_per_week: daysPerWeek,
        workout_time_minutes: workoutTimeMins,
        onboarding_completed: true,
      };

      const res = await api.submitOnboarding(payload);
      setGeneratedPlan(res.user);
      onComplete(res.user);
    } catch (err) {
      console.error('Failed to submit onboarding:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const goalsOptions = [
    { id: 'perder_peso_rapido', title: 'Perder peso rápido', desc: 'Foco em défice calórico consistente e treinos dinâmicos.' },
    { id: 'emagrecer_saudavel', title: 'Emagrecer de forma saudável', desc: 'Ritmo sustentável com reeducação alimentar e força.' },
    { id: 'reduzir_gordura_abdominal', title: 'Reduzir gordura abdominal', desc: 'Metabolismo acelerado e fortalecimento do core.' },
    { id: 'definir_corpo', title: 'Definir e tonificar o corpo', desc: 'Preservação de massa magra e diminuição do percentual de gordura.' },
  ];

  const levelOptions = [
    { id: 'iniciante', title: 'Iniciante', desc: 'Nunca treinei ou estou parado há muito tempo. Prefiro começar devagar.' },
    { id: 'intermediario', title: 'Intermédio', desc: 'Já pratico atividades físicas esporadicamente e conheço os movimentos.' },
    { id: 'avancado', title: 'Avançado', desc: 'Treino com regularidade e procuro desafios de maior intensidade.' },
  ];

  const locationOptions = [
    { id: 'casa', title: 'Treinar em Casa', icon: Home, desc: 'Exercícios práticos que dispensam grandes deslocações.' },
    { id: 'ginasio', title: 'Treinar no Ginásio', icon: Building, desc: 'Acesso a máquinas, pesos livres e espaço estruturado.' },
  ];

  const equipmentOptions = [
    { id: 'nenhum', title: 'Nenhum equipamento', desc: 'Apenas o peso do corpo (calistenia funcional).' },
    { id: 'halteres', title: 'Halteres ou pesos', desc: 'Halteres ajustáveis ou garrafas para sobrecarga.' },
    { id: 'elasticos', title: 'Elásticos de resistência', desc: 'Bandas elásticas para resistência progressiva.' },
    { id: 'completo', title: 'Equipamento completo', desc: 'Barras, bancos, anilhas e máquinas de ginásio.' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col justify-center py-10 px-4 sm:px-6 transition-colors">
      <div className="max-w-xl mx-auto w-full">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Personalize o seu Plano FitLean
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Passo {step} de {totalSteps} • Em menos de 2 minutos geramos a sua rotina ideal
          </p>

          {/* Stepper bar */}
          <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/90 dark:border-stone-800 p-6 sm:p-8 shadow-sm transition-colors">
          {/* STEP 1: DADOS BÁSICOS */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Os seus dados corporais</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Usado para calcular a sua taxa metabólica basal e calorias diárias.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Idade</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Sexo biológico</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100"
                  >
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ex: 168"
                  className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Peso Atual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    placeholder="Ex: 75.0"
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Peso Alvo / Meta (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="Ex: 65.0"
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OBJETIVO */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Qual é o seu objetivo principal?</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Iremos estruturar o volume de cardio e força em função desta meta.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {goalsOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      goal === opt.id
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border ${
                      goal === opt.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {goal === opt.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{opt.title}</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: NÍVEL */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Qual é a sua experiência atual com treino?</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Isto garante que os treinos são seguros e no ritmo adequado.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {levelOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setFitnessLevel(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      fitnessLevel === opt.id
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border ${
                      fitnessLevel === opt.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {fitnessLevel === opt.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{opt.title}</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: LOCAL */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Onde prefere treinar?</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Selecionaremos exercícios perfeitamente adaptados ao seu espaço.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {locationOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = workoutLocation === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setWorkoutLocation(opt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <div>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">{opt.title}</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: EQUIPAMENTO */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Que equipamento tem à disposição?</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Pode fazer tudo sem equipamento, mas se tiver halteres aproveitaremos.</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {equipmentOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setEquipment(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      equipment === opt.id
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center border ${
                      equipment === opt.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 dark:border-stone-600'
                    }`}>
                      {equipment === opt.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{opt.title}</h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: FREQUÊNCIA E TEMPO */}
          {step === 6 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Frequência e Duração dos Treinos</h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Defina o compromisso semanal que cabe de verdade na sua rotina.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-2">
                  Quantos dias por semana quer treinar?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDaysPerWeek(d)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                        daysPerWeek === d
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                      }`}
                    >
                      {d} dias/sem
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200 block mb-2">
                  Quanto tempo disponível por sessão?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWorkoutTimeMins(t)}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                        workoutTimeMins === t
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                      }`}
                    >
                      {t} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate preview */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Estimativa personalizada:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 dark:text-stone-300">
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block uppercase">Tempo estimado</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">~{calculateTargetTimeWeeks()} semanas</span>
                  </div>
                  <div className="bg-white/80 dark:bg-stone-900/80 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block uppercase">Queima semanal</span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400">~{daysPerWeek * 280} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            ) : <div />}

            <button
              id={step === totalSteps ? 'btn-create-my-plan' : 'btn-onboarding-next'}
              type="button"
              disabled={isGenerating}
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-emerald-600/20 disabled:opacity-50"
            >
              {isGenerating ? (
                <span>A gerar plano...</span>
              ) : step === totalSteps ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Criar o meu plano</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
