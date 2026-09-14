import React, { useState } from 'react';
import { api } from '../services/api.ts';
import type { User } from '../types.ts';
import { CHECKOUT_URL } from '../config.ts';
import {
  Flame,
  Mail,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  X
} from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'recovery' | 'activate';
  onSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail) {
      setErrorMsg('Por favor, introduza o seu endereço de email.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.identify({
        name: cleanName || cleanEmail.split('@')[0],
        email: cleanEmail,
      });

      setSuccessMsg(res.message || 'Identificação concluída com sucesso!');
      setTimeout(() => {
        onSuccess(res.user);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar identificação.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = async (target: 'owner' | 'demo') => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.quickLogin(target);
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha no acesso rápido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 block leading-none">
              Fit<span className="text-emerald-600 dark:text-emerald-400">Lean</span>
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-400 font-semibold uppercase tracking-wider">
              Identificação & Acesso
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            Aceder à Plataforma
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Indique o seu nome e email para entrar e aceder aos seus dados.
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Simple Identification Form: Nome + Email only */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              O Seu Nome
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="input-user-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pedro Santos"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              O Seu Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="input-user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            id="btn-submit-identification"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>A entrar...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Entrar na Plataforma</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </form>

        {/* External Checkout Section */}
        <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800 text-center">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2">
            Ainda não efetuou o pagamento no checkout?
          </p>
          <a
            id="btn-external-checkout-modal"
            href={CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fazer Pagamento no Checkout Externo</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>
        </div>

        {/* Fast Access shortcuts for testing */}
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="grid grid-cols-2 gap-2">
            <button
              id="btn-quick-owner"
              type="button"
              onClick={() => handleQuickAccess('owner')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Entrar diretamente como Proprietário (heliosagaz3@gmail.com)"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Proprietário</span>
            </button>

            <button
              id="btn-quick-demo"
              type="button"
              onClick={() => handleQuickAccess('demo')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Entrar com conta Demo (Ana Silva)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">Demo (Ana Silva)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
