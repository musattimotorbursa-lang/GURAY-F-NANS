import React, { useState } from 'react';
import { X, Database, Download, Upload, Check, AlertTriangle } from 'lucide-react';
import { exportAllDataAsJSON, importAllDataFromJSON } from '../../utils/storage';
import { soundFx } from '../../utils/audioNotification';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    const dataStr = exportAllDataAsJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finans_kasa_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    soundFx.playSuccess();
    setStatusMessage({ text: 'Yedek dosyası başarıyla indirildi!', type: 'success' });
  };

  const handleImportJSON = () => {
    if (!jsonText.trim()) {
      setStatusMessage({ text: 'Lütfen geçerli bir JSON metni yapıştırın.', type: 'error' });
      return;
    }
    const success = importAllDataFromJSON(jsonText.trim());
    if (success) {
      soundFx.playSuccess();
      setStatusMessage({ text: 'Veriler başarıyla geri yüklendi!', type: 'success' });
      onDataReload();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({ text: 'JSON formatı hatalı veya uyumsuz.', type: 'error' });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setJsonText(content);
      const success = importAllDataFromJSON(content);
      if (success) {
        soundFx.playSuccess();
        setStatusMessage({ text: 'Yedek dosyasından veriler başarıyla yüklendi!', type: 'success' });
        onDataReload();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ text: 'Dosya formatı geçerli bir yedek değil.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#11111f] border border-cyan-800/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Veri Yedekleme & Geri Yükleme</h3>
            <p className="text-xs text-slate-400">Verilerinizi cihazlar arası aktarın</p>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500 text-emerald-300'
                : 'bg-rose-950/40 border border-rose-500 text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Download Backup Button */}
          <button
            onClick={handleDownloadBackup}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tüm Verileri JSON Olarak İndir (Yedek Al)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-500">veya Geri Yükle</span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Upload File Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Yedek Dosyası Seç (.json):
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          {/* Paste JSON directly */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              JSON Metnini Buraya Yapıştır:
            </label>
            <textarea
              rows={3}
              placeholder="Yedek JSON metnini yapıştırın..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleImportJSON}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
          >
            Metinden Geri Yükle
          </button>
        </div>
      </div>
    </div>
  );
};
