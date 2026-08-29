import React, { useState } from 'react';
import { X, RotateCcw, CheckCircle2, Banknote } from 'lucide-react';
import { CashbookStats } from '../../types';
import { formatCurrency, getTodayString } from '../../utils/formatters';

interface DevirModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CashbookStats;
  onConfirmDevir: (newOpeningBalance: number, notes: string) => void;
}

export const DevirModal: React.FC<DevirModalProps> = ({
  isOpen,
  onClose,
  stats,
  onConfirmDevir,
}) => {
  const [devirAmount, setDevirAmount] = useState(stats.netCashBalance.toString());
  const [devirNotes, setDevirNotes] = useState('Gün Sonu Kasa Kapatma & Yeni Döneme Devir');

  if (!isOpen) return null;

  const handleDevir = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(devirAmount) || stats.netCashBalance;
    onConfirmDevir(amountNum, devirNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#11111f] border border-purple-800/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gün Sonu Devri Kapat</h3>
            <p className="text-xs text-slate-400">Devirli Kasa Defteri Kapanışı</p>
          </div>
        </div>

        {/* Current State Summary */}
        <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Önceki Devir:</span>
            <span className="text-slate-200 font-bold">{formatCurrency(stats.openingBalance)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Dönem Gelirleri:</span>
            <span className="text-emerald-400 font-bold">+{formatCurrency(stats.totalIncome)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Dönem Giderleri:</span>
            <span className="text-rose-400 font-bold">-{formatCurrency(stats.totalExpense)}</span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-300 font-bold">Yeni Devredecek Kasa:</span>
            <span className="text-emerald-400 font-black text-sm">
              {formatCurrency(stats.netCashBalance)}
            </span>
          </div>
        </div>

        <form onSubmit={handleDevir} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Devir Tutarı (₺) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={devirAmount}
              onChange={(e) => setDevirAmount(e.target.value)}
              className="w-full text-xl font-extrabold px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-emerald-400 focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Fiziki sayımda kasa fazlası/eksiği varsa tutarı düzeltebilirsiniz.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Devir Açıklaması</label>
            <input
              type="text"
              value={devirNotes}
              onChange={(e) => setDevirNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/50 transition-all active:scale-[0.98]"
          >
            Gün Sonunu Kapat & Yeni Devri Başlat
          </button>
        </form>
      </div>
    </div>
  );
};
