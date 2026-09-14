import React, { useState } from 'react';
import type { ProgressPhoto } from '../types.ts';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Calendar,
  Split,
  Eye,
  X,
  SlidersHorizontal,
  Image as ImageIcon
} from 'lucide-react';

interface ProgressPhotosProps {
  photos: ProgressPhoto[];
  onUpload: (data: { type: 'frente' | 'lado' | 'costas'; image_url: string; notes?: string; weight?: number; date?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ProgressPhotos: React.FC<ProgressPhotosProps> = ({
  photos,
  onUpload,
  onDelete,
}) => {
  const [filterType, setFilterType] = useState<'todas' | 'frente' | 'lado' | 'costas'>('todas');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Upload Form state
  const [photoType, setPhotoType] = useState<'frente' | 'lado' | 'costas'>('frente');
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoWeight, setPhotoWeight] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Compare State (Antes vs Depois)
  const [beforePhoto, setBeforePhoto] = useState<ProgressPhoto | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<ProgressPhoto | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100

  const filteredPhotos = photos.filter((p) => filterType === 'todas' || p.type === filterType);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl) return;
    setIsUploading(true);
    try {
      await onUpload({
        type: photoType,
        image_url: previewUrl,
        date: photoDate,
        weight: photoWeight ? parseFloat(photoWeight) : undefined,
        notes: photoNotes,
      });
      setShowUploadModal(false);
      setPreviewUrl('');
      setPhotoNotes('');
      setPhotoWeight('');
    } catch (err) {
      console.error('Failed to upload photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const openCompare = () => {
    if (photos.length >= 2) {
      setBeforePhoto(photos[0]);
      setAfterPhoto(photos[photos.length - 1]);
    } else if (photos.length === 1) {
      setBeforePhoto(photos[0]);
      setAfterPhoto(photos[0]);
    }
    setShowCompareModal(true);
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 sm:p-7 shadow-xs space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">Fotos de Progresso</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Acompanhe a sua evolução visual de forma privada e segura</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-compare-photos"
            type="button"
            disabled={photos.length < 2}
            onClick={openCompare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors disabled:opacity-40"
          >
            <Split className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Antes vs Depois</span>
          </button>

          <button
            id="btn-open-upload-photo"
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Foto</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
        {(['todas', 'frente', 'lado', 'costas'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterType === t
                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative rounded-2xl overflow-hidden border border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 flex flex-col shadow-xs"
            >
              <div className="aspect-3/4 relative overflow-hidden bg-stone-900">
                <img
                  src={photo.image_url}
                  alt={`Progresso ${photo.type}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-semibold capitalize">
                  {photo.type}
                </span>

                <button
                  type="button"
                  onClick={() => onDelete(photo.id)}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600/80 hover:bg-rose-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Eliminar foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2.5 text-[11px] bg-white dark:bg-stone-900 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between font-medium text-stone-700 dark:text-stone-300">
                  <span>{photo.date}</span>
                  {photo.weight && <span className="font-bold text-emerald-700 dark:text-emerald-400">{photo.weight} kg</span>}
                </div>
                {photo.notes && <p className="text-stone-500 dark:text-stone-400 text-[10px] truncate mt-0.5">{photo.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 p-6">
          <ImageIcon className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">Nenhuma foto adicionada ainda</h4>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1">
            Tire fotos periódicas com a mesma iluminação para acompanhar visualmente as mudanças no seu corpo.
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Adicionar a primeira foto</span>
          </button>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">Adicionar Foto de Progresso</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="p-5 space-y-4">
              {/* Image picker */}
              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">Fotografia *</label>
                {previewUrl ? (
                  <div className="relative aspect-3/4 max-h-56 rounded-2xl overflow-hidden bg-stone-900 mx-auto">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPreviewUrl('')}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all">
                    <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">Carregar fotografia</span>
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">PNG ou JPG até 5MB</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Type, Date, Weight */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Ângulo</label>
                  <select
                    value={photoType}
                    onChange={(e: any) => setPhotoType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200"
                  >
                    <option value="frente">Frente</option>
                    <option value="lado">Lado (Perfil)</option>
                    <option value="costas">Costas</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={photoDate}
                    onChange={(e) => setPhotoDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-800 dark:text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Peso nessa data (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Ex: 72.4"
                  value={photoWeight}
                  onChange={(e) => setPhotoWeight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">Anotações (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: 4 semanas de dieta e consistência"
                  value={photoNotes}
                  onChange={(e) => setPhotoNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!previewUrl || isUploading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'A guardar...' : 'Guardar Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compare Modal: Antes vs Depois with Interactive Split Slider */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-800 text-white p-5 sm:p-7 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Split className="w-5 h-5 text-emerald-400" />
                  Comparador: Antes vs Depois
                </h3>
                <p className="text-xs text-stone-400">Arraste a barra para comparar o progresso visual</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectors for Before and After */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Foto ANTES:</label>
                <select
                  value={beforePhoto?.id || ''}
                  onChange={(e) => setBeforePhoto(photos.find((p) => p.id === e.target.value) || null)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200"
                >
                  {photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.date} - {p.type} ({p.weight ? `${p.weight}kg` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1">Foto DEPOIS:</label>
                <select
                  value={afterPhoto?.id || ''}
                  onChange={(e) => setAfterPhoto(photos.find((p) => p.id === e.target.value) || null)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200"
                >
                  {photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.date} - {p.type} ({p.weight ? `${p.weight}kg` : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Split Visual Comparison */}
            {beforePhoto && afterPhoto && (
              <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden select-none bg-black border border-stone-800">
                {/* Image After (Background layer) */}
                <img
                  src={afterPhoto.image_url}
                  alt="Depois"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-emerald-400 z-10">
                  Depois ({afterPhoto.date})
                </div>

                {/* Image Before (Clipped top layer) */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={beforePhoto.image_url}
                    alt="Antes"
                    className="absolute inset-0 w-full h-full object-contain max-w-none"
                    style={{ width: '100%' }}
                  />
                  <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded-full text-xs font-bold text-stone-300 z-10">
                    Antes ({beforePhoto.date})
                  </div>
                </div>

                {/* Divider Line & Handle */}
                <div
                  className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg font-bold text-xs">
                    ↔
                  </div>
                </div>

                {/* Slider Input overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-30"
                />
              </div>
            )}

            {/* Side-by-side weight comparison */}
            {(() => {
              const beforeW = Number(beforePhoto?.weight);
              const afterW = Number(afterPhoto?.weight);
              const isValid = !isNaN(beforeW) && !isNaN(afterW) && beforeW > 0 && afterW > 0;
              if (!isValid) return null;
              const diff = (afterW - beforeW).toFixed(1);
              return (
                <div className="flex items-center justify-around bg-stone-800/80 p-3 rounded-2xl text-xs">
                  <div>
                    <span className="text-stone-400 block">Antes:</span>
                    <span className="text-sm font-bold text-stone-200">{beforeW} kg</span>
                  </div>
                  <div className="text-center">
                    <span className="text-stone-400 block">Diferença:</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {diff} kg
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block">Depois:</span>
                    <span className="text-sm font-bold text-emerald-400">{afterW} kg</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
