import React from 'react';
import { CHECKOUT_URL } from '../config.ts';
import {
  Flame,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  Apple,
  TrendingDown,
  Target,
  Sparkles,
  ShieldCheck,
  Clock,
  Heart,
  ChevronRight,
  Star,
  Activity,
  Zap,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void; // Open login / access
  onLogin: () => void;
  onActivate?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin, onActivate }) => {
  return (
    <div className="bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Acesso Exclusivo para Membros</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-stone-900 dark:text-stone-100 leading-[1.1]">
            Seu objetivo começa hoje.
          </h1>

          <p className="mt-5 text-base sm:text-xl text-stone-600 dark:text-stone-300 leading-relaxed max-w-2xl mx-auto font-medium">
            Treinos personalizados, alimentação e acompanhamento em uma única plataforma.
          </p>

          {/* Call to Actions - Strictly per User Specification */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {/* Primary Button: Já tenho acesso */}
            <button
              id="hero-btn-have-access"
              type="button"
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer"
            >
              <span>Já tenho acesso</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Commercial CTA Button: Quero transformar meu corpo -> CHECKOUT_URL */}
            <a
              id="hero-btn-buy"
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white font-bold text-sm sm:text-base transition-all text-center flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
            >
              <span>Quero transformar meu corpo</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </a>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onActivate || onLogin}
              className="text-xs text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-4 cursor-pointer font-medium"
            >
              Comprou recentemente na gateway? <strong>Ativar acesso com código</strong>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Treinos em casa ou ginásio
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Vídeos e animações passo a passo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Plano de alimentação adaptado
            </span>
          </div>
        </div>

        {/* Premium App Showcase Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 bg-stone-100/80 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-2xl">
          <div className="rounded-2xl overflow-hidden bg-stone-950 border border-stone-800 shadow-inner">
            <div className="px-4 py-3 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-stone-400">app.fitlean.com/dashboard</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Plataforma Ativa
              </span>
            </div>

            {/* App preview cards */}
            <div className="p-6 sm:p-8 bg-stone-950 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs text-stone-400 block">Evolução do Peso</span>
                <span className="text-2xl font-black text-white mt-1 block">74.5 kg → 69.2 kg</span>
                <span className="text-xs text-emerald-400 font-bold block mt-1">-5.3 kg eliminados</span>
              </div>

              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs text-stone-400 block">Treino do Dia</span>
                <span className="text-base font-bold text-white mt-1 block">Agachamentos & Pernas</span>
                <span className="text-xs text-amber-400 font-bold block mt-1">3 × 12 • ⏱ 60s descanso</span>
              </div>

              <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800">
                <span className="text-xs text-stone-400 block">Sequência de Consistência</span>
                <span className="text-base font-bold text-white mt-1 block">7 dias consecutivos</span>
                <span className="text-xs text-emerald-400 font-bold block mt-1">🔥 100% de hábitos cumpridos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO DE BENEFÍCIOS (5 Cards obrigatórios) */}
      <section className="py-16 bg-stone-50 dark:bg-stone-900/60 border-y border-stone-200/70 dark:border-stone-800 px-4 sm:px-6 transition-colors">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
              Tudo em uma única plataforma
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1">
              O que você recebe no FitLean
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-2">
              Desenvolvido para entregar clareza, motivação e resultados consistentes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Treinos personalizados */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 text-xl group-hover:scale-105 transition-transform">
                🏋️
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Treinos personalizados
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Exercícios adaptados ao seu nível, local e tempo diário, com demonstrações visuais do movimento correto.
              </p>
            </div>

            {/* Card 2: Alimentação */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 text-xl group-hover:scale-105 transition-transform">
                🍎
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Alimentação
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Refeições descomplicadas, guia de substituições inteligentes e controle calórico simples sem passar fome.
              </p>
            </div>

            {/* Card 3: Acompanhe o progresso */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 text-xl group-hover:scale-105 transition-transform">
                📈
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Acompanhe o progresso
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Gráficos de pesagem, medições, percentual do objetivo e comparador visual de fotos antes e depois.
              </p>
            </div>

            {/* Card 4: Mantenha a consistência */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 text-xl group-hover:scale-105 transition-transform">
                🔥
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Mantenha a consistência
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Sistema inteligente de sequências (streaks), lembretes diários e rastreamento de hábitos saudáveis.
              </p>
            </div>

            {/* Card 5: Alcance seus objetivos */}
            <div className="bg-white dark:bg-stone-900 p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4 text-xl group-hover:scale-105 transition-transform">
                🎯
              </div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Alcance seus objetivos
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                Metas claras, desbloqueio de conquistas e badges para celebrar cada marco da sua jornada fitness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEÇÃO DE EXERCÍCIOS VISUAIS */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Adeus às dúvidas nos exercícios
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 dark:text-stone-100 mt-1 leading-tight">
              Veja exatamente como executar cada movimento.
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-3 leading-relaxed">
              Não apresentamos apenas listas de texto. Cada exercício do FitLean possui animações do movimento em loop, instruções numeradas de postura, contagem de séries, repetições e cronómetro de descanso integrado.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  <strong>Zero imagens quebradas:</strong> Sistema com fallback inteligente entre animação, vídeo, imagem e diagrama visual.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  <strong>Cronómetro sonoro e visual:</strong> Bips de descanso para não perder o ritmo da sua sessão de treino.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-700 dark:text-stone-300">
                  <strong>Mais de 30 exercícios cadastrados:</strong> Cobrindo corpo inteiro, pernas, glúteos, abdómen, braços e cardio.
                </p>
              </div>
            </div>
          </div>

          {/* Exercise card mockup illustration */}
          <div className="bg-stone-900 rounded-3xl p-5 border border-stone-800 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs text-stone-400">
              <span className="font-bold text-emerald-400">EXERCÍCIO 1 DE 6</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Demonstração
              </span>
            </div>

            <div className="mt-3 bg-stone-950 rounded-2xl h-48 flex items-center justify-center border border-stone-800 relative overflow-hidden">
              <svg viewBox="0 0 200 200" className="w-36 h-36" xmlns="http://www.w3.org/2000/svg">
                <line x1="30" y1="182" x2="170" y2="182" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="55" r="14" fill="#10b981" />
                <line x1="100" y1="69" x2="100" y2="125" stroke="#059669" strokeWidth="8" strokeLinecap="round" />
                <path d="M85,120 L75,150 L70,180" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M115,120 L125,150 L130,180" stroke="#10b981" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M100,80 L75,100 L100,105" stroke="#34d399" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M100,80 L125,100 L100,105" stroke="#34d399" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div className="absolute bottom-2 left-3 text-[10px] text-stone-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Movimento anatómico guiado</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-emerald-400 font-semibold uppercase">Pernas • Glúteos</span>
                <h4 className="text-base font-black text-white">Agachamento Livre</h4>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-400 block">Séries</span>
                <span className="text-sm font-bold text-white">3 × 12 reps</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SEÇÃO MOTIVACIONAL (Conforme Especificado no item 27) */}
      <section className="py-20 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Flame className="w-3.5 h-3.5 fill-emerald-400" />
            <span>Transformação Real</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Não espere pela motivação. Comece.
          </h2>

          <p className="mt-4 text-base sm:text-xl text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Os resultados aparecem quando pequenas ações se tornam hábitos.
          </p>

          <div className="mt-8">
            <a
              id="cta-motivational-start"
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base transition-all shadow-xl hover:shadow-emerald-500/25 active:scale-[0.99]"
            >
              <span>Quero começar</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <p className="text-xs text-stone-400 mt-4">
            Acesso imediato liberado após confirmação do pagamento.
          </p>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* 5. DEPOIMENTOS / PROVA SOCIAL */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Histórias Reais</span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-1">
            Resultados de quem manteve a consistência
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
              "O FitLean facilitou tudo porque não preciso pensar no que fazer. Abro a app, vejo a animação do treino e faço em 25 minutos. Já eliminei 6.2 kg em 8 semanas."
            </p>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100">Ana Beatriz M.</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">-6.2 kg</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
              "A área de substituições inteligentes na alimentação foi o diferencial. Aprendi a comer bem sem dietas absurdas. O sistema de sequência diária vicia de forma positiva!"
            </p>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100">Ricardo Santos</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">-8.5 kg</span>
            </div>
          </div>

          <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-xs">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed italic">
              "Nunca tinha conseguido manter uma rotina de treinos por mais de 2 semanas. A plataforma dá exatamente a dose certa de motivação e clareza no progresso."
            </p>
            <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
              <span className="font-bold text-stone-900 dark:text-stone-100">Carla V.</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">-4.8 kg</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800 py-10 px-4 sm:px-6 bg-stone-50 dark:bg-stone-950 transition-colors text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-black text-stone-900 dark:text-stone-100">FitLean Pro</span>
            <span>• Todos os direitos reservados</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onLogin}
              className="text-stone-600 dark:text-stone-300 hover:text-emerald-600 font-semibold"
            >
              Já tenho acesso
            </button>
            <a
              href={CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Adquirir plano
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
