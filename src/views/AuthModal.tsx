import React, { useState } from 'react';
import { api } from '../services/api.ts';
import type { User } from '../types.ts';
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
  X
} from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register' | 'recovery';
  onSuccess: (user: User) => void;
  onCancel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'recovery' | 'reset'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
    if (!email || !password) {
      setErrorMsg('Preencha o email e a palavra-passe.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
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
      const res = await api.register({ name, email, password, confirmPassword });
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao registar utilizador.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Indique o seu email de registo.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
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
    if (!recoveryCode || !newPassword) {
      setErrorMsg('Preencha o código de 6 dígitos e a nova palavra-passe.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.resetPassword({ email, code: recoveryCode, newPassword });
      setSuccessMsg(res.message + ' Agora pode iniciar sessão.');
      setMode('login');
      setPassword(newPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao redefinir palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins for smooth evaluation
  const loginAsDemo = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.login({ email: demoEmail, password: demoPass });
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha no login demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200/90 dark:border-stone-800 my-8 animate-in zoom-in-95 duration-200 transition-colors">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Flame className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-stone-900 dark:text-stone-100">
                Fit<span className="text-emerald-600 dark:text-emerald-400">Lean</span>
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                {mode === 'login' && 'Bem-vindo de volta! Inicie sessão na sua conta.'}
                {mode === 'register' && 'Crie a sua conta e receba o seu plano personalizado.'}
                {mode === 'recovery' && 'Recupere o acesso à sua conta com facilidade.'}
                {mode === 'reset' && 'Introduza o código recebido e defina a nova palavra-passe.'}
              </p>
            </div>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Demo Badges */}
        <div className="px-6 pt-4 pb-2 bg-stone-50/70 dark:bg-stone-800/60 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mb-1.5 font-medium">
            <span>Acesso Rápido para Testes:</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => loginAsDemo('admin@fitlean.com', 'admin123')}
              className="flex-1 py-1 px-2 rounded-lg bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 text-[11px] font-bold text-center transition-colors truncate border border-purple-200/50 dark:border-purple-800/80"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => loginAsDemo('demo@fitlean.com', 'demo123')}
              className="flex-1 py-1 px-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[11px] font-bold text-center transition-colors truncate border border-emerald-200/50 dark:border-emerald-800/80"
            >
              🏃 Utilizador Demo
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    placeholder="o.seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300">Palavra-passe</label>
                  <button
                    type="button"
                    onClick={() => { resetForm(); setMode('recovery'); }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Esqueceu-se?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="chk-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="chk-remember-me" className="text-xs text-stone-600 dark:text-stone-400 select-none cursor-pointer">
                  Manter sessão iniciada
                </label>
              </div>

              <button
                id="btn-submit-login"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs mt-2"
              >
                {loading ? 'A autenticar...' : 'Iniciar Sessão'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-stone-500 dark:text-stone-400">Ainda não tem conta? </span>
                <button
                  type="button"
                  onClick={() => { resetForm(); setMode('register'); }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Criar conta grátis
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-register-name"
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-register-email"
                    type="email"
                    required
                    placeholder="maria@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Palavra-passe (mín. 6 caracteres)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-register-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Confirmar Palavra-passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              </div>

              <button
                id="btn-submit-register"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs mt-2"
              >
                {loading ? 'A criar conta...' : 'Criar Conta e Começar'}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-stone-500 dark:text-stone-400">Já tem uma conta? </span>
                <button
                  type="button"
                  onClick={() => { resetForm(); setMode('login'); }}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Iniciar Sessão
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'recovery' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Email de registo</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-recovery-email"
                    type="email"
                    required
                    placeholder="o.seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600 focus:bg-white dark:focus:bg-stone-800"
                  />
                </div>
              </div>

              <button
                id="btn-submit-forgot"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'A enviar código...' : 'Enviar Código de Recuperação'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { resetForm(); setMode('login'); }}
                  className="text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                >
                  Voltar ao Login
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD WITH 6-DIGIT CODE */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              {generatedCodeHint && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold">Código de teste gerado:</p>
                  <p className="font-mono text-base font-black tracking-widest text-amber-700 dark:text-amber-400 mt-0.5">
                    {generatedCodeHint}
                  </p>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Código de 6 dígitos</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-reset-code"
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono tracking-widest text-stone-900 dark:text-stone-100 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Nova Palavra-passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    id="input-reset-new-password"
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-emerald-600"
                  />
                </div>
              </div>

              <button
                id="btn-submit-reset-password"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {loading ? 'A guardar...' : 'Redefinir e Entrar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
