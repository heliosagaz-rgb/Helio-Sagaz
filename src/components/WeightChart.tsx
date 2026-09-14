import React, { useState } from 'react';
import type { WeightRecord } from '../types.ts';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Scale, Plus, Trash2, Calendar, TrendingDown, Target } from 'lucide-react';

interface WeightChartProps {
  records: WeightRecord[];
  targetWeight?: number;
  onAddRecord: (data: { weight: number; waist?: number; notes?: string; date?: string }) => Promise<void>;
  onDeleteRecord: (id: string) => Promise<void>;
  units?: 'metric' | 'imperial';
}

export const WeightChart: React.FC<WeightChartProps> = ({
  records,
  targetWeight,
  onAddRecord,
  onDeleteRecord,
  units = 'metric',
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '3m' | 'all'>('30d');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const unitLabel = units === 'imperial' ? 'lb' : 'kg';

  // Filter records by time range
  const filteredRecords = React.useMemo(() => {
    if (records.length === 0) return [];
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (timeRange === 'all') return sorted;

    const now = new Date().getTime();
    let daysToSubtract = 30;
    if (timeRange === '7d') daysToSubtract = 7;
    if (timeRange === '3m') daysToSubtract = 90;

    const cutoff = now - daysToSubtract * 24 * 60 * 60 * 1000;
    return sorted.filter((r) => new Date(r.date).getTime() >= cutoff);
  }, [records, timeRange]);

  const latestWeightRaw = records.length > 0 ? Number(records[records.length - 1].weight) : undefined;
  const latestWeight = latestWeightRaw !== undefined && !isNaN(latestWeightRaw) ? latestWeightRaw : undefined;

  const initialWeightRaw = records.length > 0 ? Number(records[0].weight) : undefined;
  const initialWeight = initialWeightRaw !== undefined && !isNaN(initialWeightRaw) ? initialWeightRaw : undefined;

  const totalChangeRaw = latestWeight !== undefined && initialWeight !== undefined ? latestWeight - initialWeight : 0;
  const totalChange = isNaN(totalChangeRaw) ? 0 : totalChangeRaw;

  const targetWeightNum = Number(targetWeight);
  const validTargetWeight = !isNaN(targetWeightNum) && targetWeightNum > 0 ? targetWeightNum : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) {
      setErrorMsg('Indique o peso.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onAddRecord({
        weight: parseFloat(newWeight.replace(',', '.')),
        waist: newWaist ? parseFloat(newWaist.replace(',', '.')) : undefined,
        notes: newNotes,
        date: newDate,
      });
      setNewWeight('');
      setNewWaist('');
      setNewNotes('');
      setShowAddForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao guardar registo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ios-glass-card rounded-3xl border border-white/60 dark:border-white/10 p-5 sm:p-7 shadow-lg transition-colors">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/50 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Evolução do Peso</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Histórico de pesagens e medições corporais</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time Range Selector */}
          <div className="flex ios-glass-subtle p-1 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 border border-white/50 dark:border-white/10">
            {(['7d', '30d', '3m', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === r
                    ? 'ios-glass-pill text-emerald-800 dark:text-emerald-300 shadow-xs border-emerald-500/30'
                    : 'hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {r === '7d' ? '7 dias' : r === '30d' ? '30 dias' : r === '3m' ? '3 meses' : 'Tudo'}
              </button>
            ))}
          </div>

          <button
            id="btn-open-add-weight"
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registar Peso</span>
          </button>
        </div>
      </div>

      {/* Add Weight Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="my-5 p-4 rounded-2xl ios-glass-subtle border border-white/60 dark:border-white/10 space-y-3">
          <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">Novo Registo de Peso</h4>
          
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Peso ({unitLabel}) *
              </label>
              <input
                id="input-new-weight"
                type="number"
                step="0.1"
                required
                placeholder="Ex: 72.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 text-sm focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Cintura (cm) (opcional)
              </label>
              <input
                id="input-new-waist"
                type="number"
                step="0.5"
                placeholder="Ex: 84"
                value={newWaist}
                onChange={(e) => setNewWaist(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 text-sm focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
                Data do Registo
              </label>
              <input
                id="input-weight-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 text-sm focus:outline-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 block mb-1">
              Anotações (sensação, rotina, etc.)
            </label>
            <input
              id="input-weight-notes"
              type="text"
              placeholder="Ex: Sentindo mais leveza pela manhã, treinei no dia anterior."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-100 text-sm focus:outline-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-weight"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'A guardar...' : 'Guardar Pesagem'}
            </button>
          </div>
        </form>
      )}

      {/* Metric Callouts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
        <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/80">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Peso Atual</span>
          <span className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
            {latestWeight !== undefined ? `${latestWeight} ${unitLabel}` : '--'}
          </span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/80">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Peso Objetivo</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 block">
            {validTargetWeight ? `${validTargetWeight} ${unitLabel}` : '--'}
          </span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/80">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Variação Total</span>
          <span className={`text-xl font-bold mt-0.5 block ${totalChange <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-700 dark:text-stone-300'}`}>
            {totalChange !== 0 ? `${totalChange > 0 ? '+' : ''}${totalChange.toFixed(1)} ${unitLabel}` : '0 kg'}
          </span>
        </div>

        <div className="bg-stone-50 dark:bg-stone-800/60 p-3.5 rounded-2xl border border-stone-200/60 dark:border-stone-700/80">
          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Registos Feitos</span>
          <span className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
            {records.length}
          </span>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="h-64 sm:h-72 w-full pt-2">
        {filteredRecords.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredRecords} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => {
                  if (!val || typeof val !== 'string') return '';
                  const parts = val.split('-');
                  return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : val;
                }}
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                unit={unitLabel}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as WeightRecord;
                    return (
                      <div className="bg-stone-900 dark:bg-stone-800 text-white p-3 rounded-xl text-xs shadow-xl border border-stone-800 dark:border-stone-700">
                        <p className="font-semibold text-emerald-400">{data.date}</p>
                        <p className="text-sm font-bold mt-1">{data.weight} {unitLabel}</p>
                        {data.waist && <p className="text-stone-300">Cintura: {data.waist} cm</p>}
                        {data.notes && <p className="text-stone-400 italic mt-1 max-w-[200px]">{data.notes}</p>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {targetWeight && (
                <ReferenceLine
                  y={targetWeight}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{ value: `Meta: ${targetWeight}${unitLabel}`, fill: '#059669', fontSize: 10, position: 'insideTopRight' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
            <Scale className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs">Nenhum registo de peso no período selecionado.</p>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800">
        <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide mb-3">Histórico de Pesagens</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {[...records].reverse().map((rec) => (
            <div
              key={rec.id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800/50 text-xs border border-transparent hover:border-stone-200 dark:hover:border-stone-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
                <span className="font-medium text-stone-600 dark:text-stone-300">{rec.date}</span>
                <span className="font-bold text-stone-900 dark:text-stone-100">{rec.weight} {unitLabel}</span>
                {rec.waist && (
                  <span className="text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md text-[11px]">
                    Cintura: {rec.waist}cm
                  </span>
                )}
                {rec.notes && <span className="text-stone-400 dark:text-stone-500 italic truncate max-w-xs">{rec.notes}</span>}
              </div>

              <button
                type="button"
                onClick={() => onDeleteRecord(rec.id)}
                className="text-stone-400 dark:text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg transition-colors"
                title="Eliminar registo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
