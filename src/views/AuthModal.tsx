import React, { useState } from 'react';
import { api } from '../services/api.ts';
import type { User } from '../types.ts';
import { CHECKOUT_URL } from '../config.ts';
import {
  Flame,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Sparkles,
  X
} from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'recovery' | 'activate';
  onSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'reset' | 'activate'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recovery state
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedCodeHint, setGeneratedCodeHint] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setGeneratedCodeHint(null);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Preencha o email e a palavra-passe.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login({ email: cleanEmail, password });
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Preencha o email e a palavra-passe.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg('As palavras-passe não coincidem.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.register({
        name: name.trim() || cleanEmail.split('@')[0],
        email: cleanEmail,
        password,
        confirmPassword: confirmPassword || password,
      });
      setSuccessMsg('Conta pronta com sucesso! A entrar...');
      setTimeout(() => {
        onSuccess(res.user);
      }, 500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setErrorMsg('Indique o email da sua compra e defina a sua palavra-passe.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.activateAccount({
        email: cleanEmail,
        name: name.trim() || cleanEmail.split('@')[0],
        code: activationCode.trim(),
        password,
      });
      setSuccessMsg('Conta ativada com sucesso! A entrar...');
      setTimeout(() => {
        onSuccess(res.user);
      }, 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao ativar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (target: 'owner' | 'demo') => {
    resetForm();
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Indique o seu email de registo.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(cleanEmail);
      setSuccessMsg(res.message);
      if (res.resetCode) {
        setGeneratedCodeHint(res.resetCode);
        setRecoveryCode(res.resetCode);
      }
      setMode('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao processar pedido de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!recoveryCode.trim() || !newPassword) {
      setErrorMsg('Preencha o código e a nova palavra-passe.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.resetPassword({ email: cleanEmail, code: recoveryCode.trim(), newPassword });
      setSuccessMsg(res.message + ' Agora pode iniciar sessão.');
      setMode('login');
      setPassword(newPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao redefinir palavra-passe.');
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
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Icon Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 block leading-none">
              Fit<span className="text-emerald-600 dark:text-emerald-400">Lean</span>
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-400 font-semibold uppercase tracking-wider">
              Acesso à Plataforma
            </span>
          </div>
        </div>

        {/* Navigation Mode Tabs */}
        {(mode === 'login' || mode === 'register' || mode === 'activate') && (
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl mb-6">
            <button
              id="auth-tab-login"
              type="button"
              onClick={() => {
                resetForm();
                setMode('login');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Iniciar Sessão
            </button>
            <button
              id="auth-tab-register"
              type="button"
              onClick={() => {
                resetForm();
                setMode('register');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Criar Conta
            </button>
            <button
              id="auth-tab-activate"
              type="button"
              onClick={() => {
                resetForm();
                setMode('activate');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'activate'
                  ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Ativar
            </button>
          </div>
        )}

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

        {/* ---------------- 1. LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Iniciar Sessão 👋
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Introduza as suas credenciais para aceder aos seus treinos e metas.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-login-email"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Palavra-passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setMode('recovery');
                    }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    Esqueci-me
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
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
                  <span>Entrar</span>
                )}
              </button>
            </form>

            {/* Quick 1-Click Access for Owner and Demo */}
            <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
              <span className="block text-[11px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2 text-center">
                Acesso Instantâneo
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-quick-owner"
                  type="button"
                  onClick={() => handleQuickLogin('owner')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Entrar diretamente como heliosagaz3@gmail.com"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Proprietário</span>
                </button>

                <button
                  id="btn-quick-demo"
                  type="button"
                  onClick={() => handleQuickLogin('demo')}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Entrar com conta de testes (Ana Silva)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo (Ana Silva)</span>
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
              <span>Ainda não tem conta? </span>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('register');
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Criar Conta Grátis
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 2. REGISTER MODE ---------------- */}
        {mode === 'register' && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Criar Nova Conta ✨
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Comece agora o seu plano de treinos e alimentação saudável.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-register-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-register-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Palavra-passe (mín. 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Confirmar Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    id="input-register-confirm"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a palavra-passe"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>A criar conta...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>Criar Conta e Começar</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-stone-500 dark:text-stone-400">
              <span>Já tem uma conta registada? </span>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Iniciar Sessão
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 3. ACTIVATE MODE ---------------- */}
        {mode === 'activate' && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Ativar o seu Acesso 🔑
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Insira o email utilizado na compra para desbloquear o FitLean.
              </p>
            </div>

            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Email da Compra
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="o-mesmo-email-do-checkout@exemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Seu Nome (opcional)
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Defina a sua Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'A validar ativação...' : 'Ativar e Entrar'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold cursor-pointer"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 4. RECOVERY MODE ---------------- */}
        {mode === 'recovery' && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Recuperar Acesso 🔒
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Indique o seu email para receber o código de recuperação.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'A enviar...' : 'Enviar Código de Recuperação'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold cursor-pointer"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 5. RESET PASSWORD MODE ---------------- */}
        {mode === 'reset' && (
          <div>
            <div className="mb-5">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Nova Palavra-passe 🔑
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Introduza o código recebido e a nova palavra-passe.
              </p>
            </div>

            {generatedCodeHint && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                Código gerado para testes: <strong className="font-mono text-sm">{generatedCodeHint}</strong>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Código de 6 Dígitos
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="Ex: 123456"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-mono tracking-wider"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Nova Palavra-passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? 'A alterar...' : 'Definir Nova Palavra-passe'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMode('login');
                }}
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold cursor-pointer"
              >
                Cancelar e voltar ao Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
