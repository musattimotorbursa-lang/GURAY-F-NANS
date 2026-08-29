import React, { useState, useMemo } from 'react';
import {
  Plus,
  Minus,
  Search,
  RotateCcw,
  ArrowDownRight,
  ArrowUpRight,
  Trash2,
  Edit2,
  SlidersHorizontal,
  CreditCard,
  Landmark,
  Banknote,
  ReceiptText,
} from 'lucide-react';
import { Transaction, CashbookStats } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface CashbookViewProps {
  transactions: Transaction[];
  stats: CashbookStats;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenDevirModal: () => void;
}

export const CashbookView: React.FC<CashbookViewProps> = ({
  transactions,
  stats,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenDevirModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'cash' | 'bank' | 'card'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSource = sourceFilter === 'all' || tx.paymentSource === sourceFilter;
      const matchType = typeFilter === 'all' || tx.type === typeFilter;

      return matchSearch && matchSource && matchType;
    });
  }, [transactions, searchTerm, sourceFilter, typeFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
      {/* Devirli Kasa Ana Kartı (Running Cash Balance Card) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b1035] via-[#131126] to-[#0c0c1a] p-5 sm:p-6 border border-purple-800/40 shadow-2xl shadow-purple-950/50">
        {/* Glow orb background */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ● AKTİF KASA DEFTERİ
                </span>
                <span className="text-xs text-slate-400">Devirli Sistem</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                {formatCurrency(stats.netCashBalance)}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nakit Kasa Net Kullanılabilir Bakiyesi
              </p>
            </div>

            {/* Devir Kapat / Başlat Butonu */}
            <button
              id="btn-open-devir-modal"
              onClick={onOpenDevirModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-bold border border-purple-600/40 shadow-inner transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
              <span>Gün Sonu Devri Kapat</span>
            </button>
          </div>

          {/* Breakdown Mini Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 pt-4 border-t border-purple-800/30">
            {/* Devir Bakiyesi */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">
                Önceki Devir
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-200 mt-0.5 block truncate">
                {formatCurrency(stats.openingBalance)}
              </span>
            </div>

            {/* Toplam Giriş */}
            <div className="bg-emerald-950/30 p-3 rounded-2xl border border-emerald-800/30">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-emerald-300 font-medium">
                  Toplam Gelir
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block truncate">
                +{formatCurrency(stats.totalIncome)}
              </span>
            </div>

            {/* Toplam Çıkış */}
            <div className="bg-rose-950/30 p-3 rounded-2xl border border-rose-800/30">
              <div className="flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3 text-rose-400" />
                <span className="text-[10px] sm:text-xs text-rose-300 font-medium">
                  Toplam Gider
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-rose-400 mt-0.5 block truncate">
                -{formatCurrency(stats.totalExpense)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#10101c] p-3 sm:p-4 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="cashbook-search-input"
              type="text"
              placeholder="İşlem açıklaması veya kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Gelir
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Gider
            </button>
          </div>
        </div>

        {/* Source Pills (Nakit, Banka, Kart) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Kaynak:
          </span>
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              sourceFilter === 'all'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Tüm Kaynaklar
          </button>
          <button
            onClick={() => setSourceFilter('cash')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              sourceFilter === 'cash'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-3 h-3" /> Nakit Kasa
          </button>
          <button
            onClick={() => setSourceFilter('bank')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              sourceFilter === 'bank'
                ? 'bg-sky-600/30 text-sky-300 border border-sky-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-3 h-3" /> Banka Hesabı
          </button>
          <button
            onClick={() => setSourceFilter('card')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 transition-all ${
              sourceFilter === 'card'
                ? 'bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3 h-3" /> Kredi Kartı
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ReceiptText className="w-3.5 h-3.5 text-purple-400" />
            İşlem Geçmişi ({filteredTransactions.length})
          </h3>
          <div className="flex gap-1.5">
            <button
              onClick={() => onOpenNewTransaction('income')}
              className="text-xs text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Gelir
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => onOpenNewTransaction('expense')}
              className="text-xs text-rose-400 hover:underline font-bold flex items-center gap-0.5"
            >
              <Minus className="w-3 h-3" /> Gider
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="bg-[#10101c] rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-900/30 border border-purple-600/30 mx-auto flex items-center justify-center text-purple-400">
              <ReceiptText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Henüz bir işlem bulunamadı</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Yukarıdaki butonları kullanarak yeni gelir veya gider işleyebilirsiniz.
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                id={`transaction-item-${tx.id}`}
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-[#10101c] hover:bg-[#151526] border border-slate-800/80 hover:border-purple-700/40 transition-all shadow-sm"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.isDevir
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : isIncome
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {tx.isDevir ? (
                      <RotateCcw className="w-4 h-4" />
                    ) : isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        {tx.description || tx.category}
                      </h4>
                      {tx.isDevir && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-600/30 text-purple-300 border border-purple-500/40">
                          Devir
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="text-slate-300 font-medium">{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="capitalize text-slate-400 flex items-center gap-1">
                        {tx.paymentSource === 'cash' && <Banknote className="w-2.5 h-2.5 text-emerald-400" />}
                        {tx.paymentSource === 'bank' && <Landmark className="w-2.5 h-2.5 text-sky-400" />}
                        {tx.paymentSource === 'card' && <CreditCard className="w-2.5 h-2.5 text-fuchsia-400" />}
                        {tx.paymentSource === 'cash' ? 'Nakit Kasa' : tx.paymentSource === 'bank' ? 'Banka' : 'Kart'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold block tracking-tight ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>

                  {/* Actions (Edit & Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditTransaction(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-900/30 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
