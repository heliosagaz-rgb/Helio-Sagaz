import React, { useState } from 'react';
import type { User } from '../types.ts';
import { api } from '../services/api.ts';
import {
  User as UserIcon,
  Lock,
  Scale,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Dumbbell,
  Clock,
  Calendar,
  Shield
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUserUpdated,
  onLogout,
}) => {
  // Personal data
  const [name, setName] = useState(user?.name || user?.email?.split('@')[0] || '');
  const [currentWeight, setCurrentWeight] = useState(String(user.current_weight || ''));
  const [targetWeight, setTargetWeight] = useState(String(user.target_weight || ''));
  const [height, setHeight] = useState(String(user.height || ''));
  const [age, setAge] = useState(String(user.age || ''));
  const [daysPerWeek, setDaysPerWeek] = useState(user.days_per_week || 4);
  const [workoutTimeMins, setWorkoutTimeMins] = useState(user.workout_time_minutes || 30);
  const [units, setUnits] = useState<'metric' | 'imperial'>(user.units || 'metric');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status flags
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await api.updateProfile({
        name,
        current_weight: currentWeight ? parseFloat(currentWeight) : undefined,
        target_weight: targetWeight ? parseFloat(targetWeight) : undefined,
        height: height ? parseFloat(height) : undefined,
        age: age ? parseInt(age) : undefined,
        days_per_week: daysPerWeek,
        workout_time_minutes: workoutTimeMins,
        units,
      });
      onUserUpdated(res.user);
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Erro ao atualizar perfil.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Palavra-passe alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Erro ao alterar palavra-passe.' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-6 sm:p-8 shadow-xs transition-colors">
        <div className="flex items-center gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-black text-2xl flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
            {((user?.name || user?.email || 'U').trim().charAt(0) || 'U').toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{user?.name || user?.email?.split('@')[0] || 'Utilizador'}</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-semibold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
                {user.role}
              </span>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                Membro desde {new Date(user.created_at).toLocaleDateString('pt-PT')}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-5">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide">
            Dados Pessoais e Metas
          </h3>

          {profileMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              profileMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}>
              {profileMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Unidade de Medida</label>
              <select
                value={units}
                onChange={(e: any) => setUnits(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              >
                <option value="metric">Métrico (kg, cm)</option>
                <option value="imperial">Imperial (lb, ft)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Peso Atual (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Meta Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Altura (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Idade</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Dias de treino por semana</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              >
                <option value={2}>2 dias por semana</option>
                <option value={3}>3 dias por semana</option>
                <option value={4}>4 dias por semana</option>
                <option value={5}>5 dias por semana</option>
                <option value={6}>6 dias por semana</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Duração por treino</label>
              <select
                value={workoutTimeMins}
                onChange={(e) => setWorkoutTimeMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-900 dark:text-stone-100"
              >
                <option value={15}>15 minutos (Rápido)</option>
                <option value={30}>30 minutos (Padrão)</option>
                <option value={45}>45 minutos (Avançado)</option>
                <option value={60}>60 minutos (Completo)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50 shadow-xs"
            >
              {savingProfile ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </form>

        {/* Change Password */}
        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3">
            Alterar Palavra-passe
          </h3>

          {passwordMsg && (
            <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 mb-3 ${
              passwordMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
            }`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Palavra-passe atual</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-stone-700 dark:text-stone-300 block mb-1">Nova palavra-passe</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPassword}
                className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold transition-colors disabled:opacity-50"
              >
                {savingPassword ? 'A alterar...' : 'Atualizar Palavra-passe'}
              </button>
            </div>
          </form>
        </div>

        {/* Logout session */}
        <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200">Terminar Sessão</h4>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">Sair com segurança deste dispositivo.</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/80 text-xs font-bold border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Terminar Sessão</span>
          </button>
        </div>
      </div>
    </div>
  );
};
