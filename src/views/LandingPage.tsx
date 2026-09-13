import React from 'react';
import {
  Flame,
  ArrowRight,
  CheckCircle2,
  Play,
  Dumbbell,
  Apple,
  TrendingDown,
  Target,
  Sparkles,
  ShieldCheck,
  Clock,
  Heart,
  ChevronRight,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Plataforma Completa de Emagrecimento e Saúde</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-[1.1]">
            Emagreça de forma simples. Treine melhor.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300">
              Alcance os seus objetivos.
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto">
            Um plano personalizado de treinos ilustrados, reeducação alimentar simples e acompanhamento diário para transformar o seu corpo sem dietas restritivas.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-btn-start"
              type="button"
              onClick={onStart}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2"
            >
              <span>Começar Agora Gratuitamente</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#como-funciona"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-sm transition-colors text-center"
            >
              Como Funciona
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Sem equipamento obrigatório
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Treinos de 15 a 45 min
            </span>
          </div>
        </div>

        {/* App Showcase Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 bg-stone-100/80 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xl">
          <div className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 shadow-inner">
            <div className="px-4 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-stone-500">app.fitlean.com/dashboard</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">● Sessão Ativa</span>
            </div>

            {/* Simulated app preview inside */}
            <div className="p-6 sm:p-8 bg-stone-950 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs text-stone-400 block">Progresso do Peso</span>
                <span className="text-2xl font-black text-white mt-1 block">74.5 kg → 69.2 kg</span>
                <span className="text-xs text-emerald-400 font-bold block mt-1">-5.3 kg eliminados</span>
              </div>

              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs text-stone-400 block">Treino de Hoje</span>
                <span className="text-base font-bold text-white mt-1 block">Queima Rápida HIIT 20min</span>
                <span className="text-xs text-amber-400 font-bold block mt-1">~240 kcal • Em casa</span>
              </div>

              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs text-stone-400 block">Meta Diária de Hábitos</span>
                <span className="text-base font-bold text-white mt-1 block">5 de 6 Concluídos</span>
                <span className="text-xs text-emerald-400 font-bold block mt-1">🔥 7 dias seguidos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMO FUNCIONA (3 PASSOS) */}
      <section id="como-funciona" className="py-16 bg-stone-50 dark:bg-stone-900/60 border-y border-stone-200/70 dark:border-stone-800 px-4 sm:px-6 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Simplicidade</span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
              Como funciona o FitLean em 3 passos
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">Sem complicações nem cardápios impossíveis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-base flex items-center justify-center mb-4">
                1
              </span>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Responda a perguntas rápidas</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Indique o seu peso atual, objetivo pretendido, onde prefere treinar e o tempo disponível.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-base flex items-center justify-center mb-4">
                2
              </span>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Receba o seu plano completo</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Exercícios animados passo a passo, meta de calorias calculada e orientações nutricionais personalizadas.
              </p>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
              <span className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-base flex items-center justify-center mb-4">
                3
              </span>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Acompanhe a sua evolução</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">
                Registe o peso, compare fotos antes e depois e celebre cada marco com consistência diária.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Tudo o que precisa</span>
          <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
            Construído para resultados reais e duradouros
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Plano de Treino Semanal</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Estruturado para queimar gordura e tonificar pernas, glúteos, abdómen e braços sem desgaste excessivo.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Play className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Exercícios com Animações</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Demonstrações visuais interativas em loop, séries, repetições, descanso cronometrado e dicas de postura.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Apple className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Reeducação Alimentar</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Contador intuitivo de calorias e macros, substituições inteligentes e mais de 15 receitas deliciosas.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Gráfico de Peso e Fotos</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Visualização de evolução a 7 dias, 30 dias e 3 meses. Comparador visual interativo de Antes vs Depois.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Metas & Hábitos Diários</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Controle de consumo de água, passos, sono e sequência de dias com fogo motivacional ativo.
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Histórico Seguro e Privado</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Os seus dados, medições e fotos ficam guardados de forma segura, com acesso restrito à sua conta.
            </p>
          </div>
        </div>
      </section>

      {/* 4. DEPOIMENTOS E PROVA SOCIAL */}
      <section id="depoimentos" className="py-16 bg-stone-50 dark:bg-stone-900/60 border-t border-stone-200/70 dark:border-stone-800 px-4 sm:px-6 transition-colors">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Transformações Reais</span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
              Pessoas reais, resultados sustentáveis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                  "O melhor do FitLean é não precisar passar fome nem ficar 2 horas no ginásio. Em 8 semanas perdi 6,2 kg treinando apenas na sala de casa."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block">Carla M.</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">-6,2 kg em 8 semanas</span>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                  "As animações dos exercícios ajudam imenso para não errar a postura. O cronómetro de descanso não me deixa perder o ritmo do treino."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block">Ricardo S.</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">-8,4 kg em 3 meses</span>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex text-amber-400 gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 italic leading-relaxed">
                  "A tabela de substituições inteligentes abriu os meus olhos. Troquei pequenas coisas e o resultado na balança foi imediato."
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 block">Sofia P.</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">-4,1 kg no primeiro mês</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Pronto para transformar o seu corpo com simplicidade?
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Junte-se à plataforma e comece hoje mesmo o seu plano de treinos e alimentação saudável.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-6 px-8 py-3.5 rounded-2xl bg-white text-emerald-900 font-black text-sm hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Começar Gratuitamente
          </button>
        </div>
      </section>

      {/* 6. MEDICAL DISCLAIMER & FOOTER */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 py-10 px-4 sm:px-6 text-xs text-stone-500 dark:text-stone-400 transition-colors">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
            <strong className="text-stone-700 dark:text-stone-300 block mb-1">Aviso de Saúde e Responsabilidade:</strong>
            As informações, planos de treinos e sugestões nutricionais fornecidos pelo FitLean têm caráter meramente educativo e motivacional. Não substituem o aconselhamento, diagnóstico ou acompanhamento de profissionais habilitados de saúde, nutrição e educação física. Antes de iniciar qualquer rotina de exercícios físicos ou alteração alimentar significativa, consulte o seu médico assistente.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 text-stone-400 dark:text-stone-500">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-stone-700 dark:text-stone-300">FitLean © {new Date().getFullYear()}</span>
              <span>• Todos os direitos reservados.</span>
            </div>

            <div className="flex gap-4 text-[11px]">
              <a href="#como-funciona" className="hover:text-stone-700 dark:hover:text-stone-300">Como funciona</a>
              <a href="#funcionalidades" className="hover:text-stone-700 dark:hover:text-stone-300">Funcionalidades</a>
              <button onClick={onLogin} className="hover:text-stone-700 dark:hover:text-stone-300">Iniciar Sessão</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
