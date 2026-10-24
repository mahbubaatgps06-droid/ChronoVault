import React, { useState, useRef } from 'react';
import { VaultPhoto } from '../../types';
import { storage } from '../../utils/storage';
import { playSound, triggerHaptic } from '../../utils/sound';
import { Plus, Trash2, ArrowLeft, ZoomIn, Eye, ShieldCheck, Download } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const PhotoVaultApp: React.FC<Props> = ({ onBack }) => {
  const [photos, setPhotos] = useState<VaultPhoto[]>(() => storage.getPhotos());
  const [selectedPhoto, setSelectedPhoto] = useState<VaultPhoto | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const newPhoto: VaultPhoto = {
        id: `photo-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        dataUrl: reader.result as string,
        dateAdded: new Date().toISOString().split('T')[0],
        sizeBytes: file.size,
      };

      const updated = [newPhoto, ...photos];
      setPhotos(updated);
      storage.setPhotos(updated);
      playSound.keyPress();
      triggerHaptic(15);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    storage.setPhotos(updated);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
    playSound.lockClick();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Vault</span>
        </button>
        <div className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white">
          <Eye className="w-4 h-4 text-blue-400" />
          <span>Secure Gallery</span>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Import</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Subheader info */}
      <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hidden from Phone Gallery · AES Stored</span>
        </div>
        <span className="font-mono text-slate-400">{photos.length} items</span>
      </div>

      {/* Photo Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {photos.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-400">
              <Eye className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">Vault Gallery is Empty</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Import confidential photos or documents. They will never appear in the normal phone album.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-all"
            >
              Select Image to Hide
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800/80 cursor-pointer shadow-sm hover:border-blue-500/50 transition-all"
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                  <span className="text-[11px] font-medium text-white truncate max-w-[70%]">
                    {photo.title}
                  </span>
                  <button
                    onClick={(e) => handleDelete(photo.id, e)}
                    className="p-1 rounded-md bg-red-500/80 hover:bg-red-500 text-white transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-white">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 text-sm hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <span className="text-sm font-medium truncate max-w-[200px]">
              {selectedPhoto.title}
            </span>
            <button
              onClick={() => handleDelete(selectedPhoto.id)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 overflow-hidden">
            <img
              src={selectedPhoto.dataUrl}
              alt={selectedPhoto.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
            <span>Added {selectedPhoto.dateAdded}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secured inside Clock Vault
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
