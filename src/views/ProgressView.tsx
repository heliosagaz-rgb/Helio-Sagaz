import React, { useState, useEffect } from 'react';
import type { WeightRecord, ProgressPhoto, User } from '../types.ts';
import { api } from '../services/api.ts';
import { WeightChart } from '../components/WeightChart.tsx';
import { ProgressPhotos } from '../components/ProgressPhotos.tsx';
import { Scale, Camera, Award, Sparkles, TrendingDown } from 'lucide-react';

interface ProgressViewProps {
  user: User;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'peso' | 'fotos'>('peso');
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [wRes, pRes] = await Promise.all([
        api.getWeightRecords(),
        api.getProgressPhotos(),
      ]);
      setWeightRecords(wRes);
      setPhotos(pRes);
    } catch (err) {
      console.error('Failed loading progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWeight = async (data: any) => {
    await api.logWeight(data);
    const updated = await api.getWeightRecords();
    setWeightRecords(updated);
  };

  const handleDeleteWeight = async (id: string) => {
    await api.deleteWeight(id);
    const updated = await api.getWeightRecords();
    setWeightRecords(updated);
  };

  const handleUploadPhoto = async (data: any) => {
    await api.uploadProgressPhoto(data);
    const updated = await api.getProgressPhotos();
    setPhotos(updated);
  };

  const handleDeletePhoto = async (id: string) => {
    await api.deleteProgressPhoto(id);
    const updated = await api.getProgressPhotos();
    setPhotos(updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Toggle Switcher */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-2 sm:p-2.5 flex items-center gap-2 shadow-xs transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('peso')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'peso'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Evolução do Peso & Medidas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fotos')}
          className={`flex-1 py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'fotos'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Fotos de Progresso (Antes vs Depois)</span>
        </button>
      </div>

      {activeTab === 'peso' ? (
        <WeightChart
          records={weightRecords}
          targetWeight={user.target_weight}
          onAddRecord={handleAddWeight}
          onDeleteRecord={handleDeleteWeight}
        />
      ) : (
        <ProgressPhotos
          photos={photos}
          onUpload={handleUploadPhoto}
          onDelete={handleDeletePhoto}
        />
      )}
    </div>
  );
};
