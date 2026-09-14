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
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao ativar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim() || !cleanEmail || !password) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As palavras-passe não coincidem.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.register({ name: name.trim(), email: cleanEmail, password, confirmPassword });
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao criar conta.');
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
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100 block leading-none">
              Fit<span className="text-emerald-600 dark:text-emerald-400">Lean</span>
            </span>
            <span className="text-[10px] text-stone-400 dark:text-stone-400 font-semibold uppercase tracking-wider">
              Área de Membros
            </span>
          </div>
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

        {/* ---------------- 1. LOGIN MODE ---------------- */}
        {mode === 'login' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Bem-vindo de volta 👋
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Continue a sua transformação.
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
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    Esqueci-me da palavra-passe
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
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

            {/* Links at bottom of Login */}
            <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 space-y-3 text-center text-xs text-stone-500 dark:text-stone-400">
              <div className="flex items-center justify-center gap-1.5">
                <span>Ainda não tenho acesso?</span>
                <a
                  href={CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Adquirir o FitLean</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setMode('activate');
                  }}
                  className="text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold"
                >
                  Já comprou na gateway? Ative o seu acesso aqui
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- 2. ACTIVATE MODE ---------------- */}
        {mode === 'activate' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Ativar o seu Acesso 🔑
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Insira o email utilizado na compra para ativar o FitLean.
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
                  Seu Nome
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
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 3. RECOVERY MODE ---------------- */}
        {mode === 'recovery' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Recuperar Acesso 🔒
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
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
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold"
              >
                Voltar para o Login
              </button>
            </div>
          </div>
        )}

        {/* ---------------- 4. RESET PASSWORD MODE ---------------- */}
        {mode === 'reset' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
                Nova Palavra-passe 🔑
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
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
                className="text-xs text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 font-semibold"
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
