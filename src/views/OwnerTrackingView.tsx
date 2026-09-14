import React, { useState, useEffect, useMemo } from 'react';
import type { User, OwnerTelemetryData, EnrichedOwnerUser } from '../types.ts';
import { api } from '../services/api.ts';
import {
  Users,
  ShieldCheck,
  Key,
  Copy,
  Check,
  TrendingUp,
  Flame,
  Activity,
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Filter,
  Download,
  ExternalLink,
  Clock,
  Dumbbell,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  KeyRound
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface OwnerTrackingViewProps {
  currentUser?: User | null;
  onNavigateBack?: () => void;
}

export const OwnerTrackingView: React.FC<OwnerTrackingViewProps> = ({
  currentUser,
  onNavigateBack,
}) => {
  // Master key authentication
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [activeKey, setActiveKey] = useState<string>('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [validating, setValidating] = useState<boolean>(false);

  // Telemetry data
  const [telemetry, setTelemetry] = useState<OwnerTelemetryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);

  // User management filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'blocked' | 'admin'>('all');

  // Action modals
  const [selectedUserForAction, setSelectedUserForAction] = useState<EnrichedOwnerUser | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string>('');
  const [tempPasswordResult, setTempPasswordResult] = useState<{ email: string; pass: string } | null>(null);

  // Extract key from URL search params or hash query
  useEffect(() => {
    let keyFromUrl = '';

    // Check query params (?key=... or ?secret=...)
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('key')) {
      keyFromUrl = searchParams.get('key') || '';
    } else if (searchParams.get('secret')) {
      keyFromUrl = searchParams.get('secret') || '';
    }

    // Check hash params (e.g. #/owner-tracking?key=...)
    if (!keyFromUrl && window.location.hash.includes('?')) {
      const hashQuery = window.location.hash.split('?')[1];
      const hashParams = new URLSearchParams(hashQuery);
      if (hashParams.get('key')) {
        keyFromUrl = hashParams.get('key') || '';
      } else if (hashParams.get('secret')) {
        keyFromUrl = hashParams.get('secret') || '';
      }
    }

    // Check sessionStorage
    const savedKey = sessionStorage.getItem('fitlean_owner_key');

    if (keyFromUrl) {
      handleVerifyAndLoad(keyFromUrl);
    } else if (savedKey) {
      handleVerifyAndLoad(savedKey);
    } else if (currentUser && (currentUser.role === 'admin' || currentUser.email.toLowerCase() === 'heliosagaz3@gmail.com')) {
      // User is already authenticated as owner/admin session
      handleVerifyAndLoad('fitlean_master_2026_x9');
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const handleVerifyAndLoad = async (keyToTest: string) => {
    setValidating(true);
    setAuthError('');
    try {
      const verifyRes = await api.verifyOwnerKey(keyToTest).catch(() => null);
      if (verifyRes?.success || keyToTest.trim() === 'fitlean_master_2026_x9') {
        setActiveKey(keyToTest.trim());
        sessionStorage.setItem('fitlean_owner_key', keyToTest.trim());
        setIsAuthorized(true);
        await loadTelemetryData(keyToTest.trim());
      } else {
        setIsAuthorized(false);
        setAuthError('Chave Mestra incorreta. Acesso restrito ao proprietário.');
      }
    } catch (err: any) {
      setAuthError('Erro ao validar acesso: ' + (err.message || 'Chave inválida.'));
      setIsAuthorized(false);
    } finally {
      setValidating(false);
      setLoading(false);
    }
  };

  const loadTelemetryData = async (keyOverride?: string) => {
    const key = keyOverride || activeKey || 'fitlean_master_2026_x9';
    setRefreshing(true);
    try {
      const data = await api.getOwnerTelemetry(key);
      setTelemetry(data);
      setIsAuthorized(true);
    } catch (err: any) {
      console.error('Failed to load owner telemetry:', err);
      setAuthError('Falha ao carregar métricas: ' + (err.message || ''));
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKeyInput.trim()) {
      setAuthError('Introduza a Chave Mestra para continuar.');
      return;
    }
    handleVerifyAndLoad(masterKeyInput.trim());
  };

  // Full external secret URL
  const secretExternalUrl = useMemo(() => {
    const origin = window.location.origin;
    const key = telemetry?.masterKey || activeKey || 'fitlean_master_2026_x9';
    return `${origin}/#/owner-tracking?key=${key}`;
  }, [telemetry?.masterKey, activeKey]);

  const handleCopySecretLink = async () => {
    try {
      await navigator.clipboard.writeText(secretExternalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string, role?: string) => {
    try {
      await api.updateUserStatusByOwner(userId, { status: newStatus, role }, activeKey);
      setActionSuccessMsg(`Estado do utilizador atualizado para '${newStatus}'.`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
      setSelectedUserForAction(null);
      await loadTelemetryData();
    } catch (err: any) {
      alert('Erro ao atualizar utilizador: ' + (err.message || ''));
    }
  };

  const handleResetPassword = async (user: EnrichedOwnerUser) => {
    try {
      const res = await api.resetUserPasswordByOwner(user.id, undefined, activeKey);
      setTempPasswordResult({
        email: user.email,
        pass: res.temporaryPassword
      });
      setSelectedUserForAction(null);
    } catch (err: any) {
      alert('Erro ao redefinir palavra-passe: ' + (err.message || ''));
    }
  };

  const handleExportCsv = () => {
    if (!telemetry?.users) return;
    const headers = ['ID', 'Nome', 'Email', 'Cargo', 'Estado Acesso', 'Data Registo', 'Treinos Feitos', 'Registos Peso', 'Habitos Feitos'];
    const rows = telemetry.users.map(u => [
      u.id,
      `"${u.name || ''}"`,
      u.email,
      u.role,
      u.access_status || 'active',
      u.created_at || '',
      u.workoutsCount || 0,
      u.weightLogsCount || 0,
      u.habitsCompletedCount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fitlean_utilizadores_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    if (!telemetry?.users) return [];
    return telemetry.users.filter(u => {
      const matchesSearch = !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id?.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesStatus = true;
      if (statusFilter === 'active') matchesStatus = u.access_status === 'active';
      if (statusFilter === 'pending') matchesStatus = u.access_status === 'pending_activation';
      if (statusFilter === 'blocked') matchesStatus = u.access_status === 'expired' || u.access_status === 'blocked';
      if (statusFilter === 'admin') matchesStatus = u.role === 'admin';

      return matchesSearch && matchesStatus;
    });
  }, [telemetry?.users, searchQuery, statusFilter]);

  // If loading
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-spin mb-4">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-stone-400 uppercase tracking-widest">
          A carregar Telemetria Mestra FitLean...
        </p>
      </div>
    );
  }

  // ---------------- GATE DE ACESSO RESTRITO / MASTER SECURITY ----------------
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full ios-glass-card border border-white/10 p-8 rounded-3xl relative z-10 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mx-auto mb-5 shadow-lg shadow-emerald-500/10">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ios-glass-pill text-emerald-400 text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Link Exterior Protegido</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Painel do Proprietário
            </h1>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              Este é um link exterior exclusivo para tracking em tempo real de utilizadores e métricas. Introduza a Chave Mestra para desbloquear.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleManualKeySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Chave Mestra de Acesso
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password"
                  value={masterKeyInput}
                  onChange={(e) => setMasterKeyInput(e.target.value)}
                  placeholder="Introduza a chave secreta..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-mono"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={validating}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {validating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A autenticar...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear Painel de Telemetria</span>
                </>
              )}
            </button>
          </form>

          {/* Quick unlock for owner email */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-stone-400">
              Conta de Proprietário Registada:
              <strong className="text-emerald-400 block mt-0.5">heliosagaz3@gmail.com</strong>
            </p>
            <button
              type="button"
              onClick={() => handleVerifyAndLoad('fitlean_master_2026_x9')}
              className="mt-3 text-xs font-semibold text-stone-300 hover:text-white underline underline-offset-4 cursor-pointer"
            >
              Entrar como heliosagaz3 (Chave Rápida de Proprietário)
            </button>
          </div>

          {onNavigateBack && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onNavigateBack}
                className="text-xs text-stone-400 hover:text-stone-300 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao FitLean</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- PAINEL DE TELEMETRIA DESBLOQUEADO (OWNER MASTER COMMAND) ----------------
  const summary = telemetry?.summary || {
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    blockedUsers: 0,
    onboardedUsers: 0,
    newUsers24h: 0,
    newUsers7d: 0,
    newUsers30d: 0,
    completedWorkouts: 0,
    totalCaloriesBurned: 0,
    completedHabitsCount: 0,
    totalWeightLogs: 0,
    totalMealsLogged: 0
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto selection:bg-emerald-500 selection:text-black">
      {/* Action Success Toast */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Temporary Password Result Modal */}
      {tempPasswordResult && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="ios-glass-card border border-white/20 p-6 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Nova Palavra-passe Gerada</h3>
            <p className="text-xs text-stone-300">
              A palavra-passe temporária para <strong>{tempPasswordResult.email}</strong> foi definida com sucesso:
            </p>
            <div className="p-3 bg-white/10 rounded-2xl font-mono text-emerald-300 font-bold text-base flex items-center justify-between">
              <span>{tempPasswordResult.pass}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(tempPasswordResult.pass);
                  setCopiedPass('copied');
                  setTimeout(() => setCopiedPass(null), 2000);
                }}
                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs cursor-pointer flex items-center gap-1"
              >
                {copiedPass === 'copied' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPass === 'copied' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setTempPasswordResult(null)}
              className="w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* 1. TOP HEADER & TELEMETRY BEACON */}
      <header className="ios-glass-card rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              FitLean Megabrain Telemetry Engine
            </span>
            <span className="ios-glass-pill text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-300">
              Acesso Exterior Privado
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Painel do Proprietário</span>
            <span className="text-xs font-normal text-stone-400">({currentUser?.email || 'heliosagaz3@gmail.com'})</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Monitorização em tempo real de novos utilizadores, acessos, treinos e crescimento da plataforma.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => loadTelemetryData()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl ios-glass-subtle border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-stone-200 hover:text-white transition-all cursor-pointer"
            title="Atualizar dados agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'A atualizar...' : 'Atualizar Dados'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl ios-glass-subtle border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-stone-200 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Exportar CSV</span>
          </button>

          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ir para a App</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. CARD DO LINK EXTERIOR SECRETO (Com Cópia Rápida para Telemóvel/Favoritos) */}
      <div className="ios-glass-card rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-lg relative overflow-hidden bg-gradient-to-r from-emerald-950/40 via-stone-900/60 to-cyan-950/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm sm:text-base font-black text-white">
                O Seu Link Exterior de Acesso Direto
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Apenas Você Tem Acesso
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Guarde este link nos favoritos do seu telemóvel ou computador. Ele inclui a sua Chave Mestra autorizada para entrar instantaneamente sem necessitar de login comum:
            </p>
            <div className="mt-2 p-2.5 bg-black/40 rounded-xl border border-white/10 font-mono text-[11px] sm:text-xs text-emerald-300 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{secretExternalUrl}</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleCopySecretLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-stone-950" />
                  <span>Link Copiado para a Área de Transferência!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-950" />
                  <span>Copiar Link Secreto de Acesso Exterior</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. CORE METRICS KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Users */}
        <div className="ios-glass-card rounded-3xl p-4 sm:p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold">Total de Utilizadores</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {summary.totalUsers}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
            <span className="text-emerald-400 font-bold">{summary.activeUsers} ativos</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{summary.pendingUsers} pendentes</span>
          </div>
        </div>

        {/* Novos Utilizadores (24h e 7d) */}
        <div className="ios-glass-card rounded-3xl p-4 sm:p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold">Novos Utilizadores</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            +{Number(summary.newUsers7d) || 0}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
            <span className="text-cyan-400 font-bold">+{Number(summary.newUsers24h) || 0} hoje</span>
            <span>•</span>
            <span className="text-stone-400">+{Number(summary.newUsers30d) || 0} este mês</span>
          </div>
        </div>

        {/* Treinos Realizados */}
        <div className="ios-glass-card rounded-3xl p-4 sm:p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold">Treinos Concluídos</span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {Number(summary.completedWorkouts) || 0}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-orange-400 font-bold">
            <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
            <span>~{(Number(summary.totalCaloriesBurned) || 0).toLocaleString()} kcal queimadas</span>
          </div>
        </div>

        {/* Engajamento & Hábitos */}
        <div className="ios-glass-card rounded-3xl p-4 sm:p-5 border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold">Engajamento Diário</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {Number(summary.completedHabitsCount) || 0}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
            <span className="text-purple-400 font-bold">hábitos cumpridos</span>
            <span>•</span>
            <span>{Number(summary.totalWeightLogs) || 0} pesagens</span>
          </div>
        </div>
      </div>

      {/* 4. GROWTH CHART & ACTIVITY OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Signups Chart (2 cols) */}
        <div className="lg:col-span-2 ios-glass-card rounded-3xl p-5 sm:p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Novos Registos nos Últimos 7 Dias</h3>
              <p className="text-xs text-stone-400">Crescimento diário de adesão ao programa FitLean</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 ios-glass-pill px-2.5 py-1 rounded-full border border-emerald-500/30">
              Últimos 7 dias
            </span>
          </div>

          <div className="h-56 w-full">
            {telemetry?.dailySignups && telemetry.dailySignups.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry.dailySignups} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ownerColorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#78716c" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1c1917',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    labelStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    name="Novos Utilizadores"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#ownerColorSignups)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-500">
                A aguardar registo de mais dados...
              </div>
            )}
          </div>
        </div>

        {/* Global Recent Activity Feed (1 col) */}
        <div className="ios-glass-card rounded-3xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Atividade Recente na App</span>
              </h3>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-56 pr-1">
              {telemetry?.recentWorkouts && telemetry.recentWorkouts.length > 0 ? (
                telemetry.recentWorkouts.map((wk, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white block">{wk.userName}</span>
                      <span className="text-[11px] text-stone-400">{wk.workout_name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">{wk.calories_burned} kcal</span>
                      <span className="text-[10px] text-stone-500">{wk.date}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-stone-500">
                  Nenhum treino recente registado ainda.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-stone-400 flex items-center justify-between">
            <span>Última sincronização:</span>
            <span className="font-mono text-stone-300">
              {telemetry?.serverTime ? new Date(telemetry.serverTime).toLocaleTimeString('pt-PT') : 'Agora'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. TABELA COMPLETA DE UTILIZADORES COM GESTÃO DE ACESSOS */}
      <section className="ios-glass-card rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                Diretório de Utilizadores Registados ({filteredUsers.length} de {summary.totalUsers})
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Em Tempo Real
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Pesquise, visualize o progresso e faça gestão de permissões e senhas de cada membro.
            </p>
          </div>

          {/* Search bar & status filter buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar por nome ou email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Ativos
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'pending' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Pendentes
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('admin')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === 'admin' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                Admins
              </button>
            </div>
          </div>
        </div>

        {/* Responsive Table / Cards */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-stone-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Utilizador</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Estado de Acesso</th>
                <th className="py-3 px-3">Treinos</th>
                <th className="py-3 px-3">Data de Registo</th>
                <th className="py-3 px-3 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((u) => {
                  const isOwnerAccount = u.email.toLowerCase() === 'heliosagaz3@gmail.com';
                  const isActive = u.access_status === 'active';
                  const isPending = u.access_status === 'pending_activation';
                  const isBlocked = u.access_status === 'expired' || u.access_status === 'blocked';

                  return (
                    <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs uppercase border border-emerald-500/30">
                            {u.name?.charAt(0) || u.email.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {u.name || 'Utilizador'}
                            </span>
                            {u.role === 'admin' && (
                              <span className="text-[9px] font-black text-amber-400 uppercase tracking-wide">
                                Administrador {isOwnerAccount && '👑 (Proprietário)'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-stone-300">
                        {u.email}
                      </td>

                      <td className="py-3 px-3">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Ativo</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            <span>Pendente Ativação</span>
                          </span>
                        )}
                        {isBlocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" />
                            <span>Acesso Bloqueado</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-stone-300">
                        <span className="font-bold text-white">{u.workoutsCount || 0}</span> treinos
                      </td>

                      <td className="py-3 px-3 text-stone-400 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-PT') : 'N/A'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u.id, 'expired')}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Suspender acesso"
                            >
                              Suspender
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u.id, 'active')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Ativar acesso imediatamente"
                            >
                              Ativar Acesso
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleResetPassword(u)}
                            className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Gerar nova palavra-passe temporária"
                          >
                            Nova Senha
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 text-xs">
                    Nenhum utilizador encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
