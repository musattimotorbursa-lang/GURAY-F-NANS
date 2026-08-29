import React from 'react';
import {
  Plus,
  CreditCard as CardIcon,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { CreditCard } from '../types';
import { detectBankTheme } from '../data/bankPresets';
import { formatCurrency, getDaysDifference, getNextDueDayDate, formatDateShort } from '../utils/formatters';

interface CreditCardsViewProps {
  cards: CreditCard[];
  onOpenNewCardModal: () => void;
  onEditCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onOpenPayDebtModal: (card: CreditCard) => void;
  onOpenSpendCardModal: (card: CreditCard) => void;
}

export const CreditCardsView: React.FC<CreditCardsViewProps> = ({
  cards,
  onOpenNewCardModal,
  onEditCard,
  onDeleteCard,
  onOpenPayDebtModal,
  onOpenSpendCardModal,
}) => {
  const totalLimits = cards.reduce((acc, c) => acc + (c.totalLimit || 0), 0);
  const totalDebts = cards.reduce((acc, c) => acc + (c.currentDebt || 0), 0);
  const totalAvailable = Math.max(0, totalLimits - totalDebts);
  const totalUsagePercentage = totalLimits > 0 ? Math.min(100, Math.round((totalDebts / totalLimits) * 100)) : 0;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
      {/* Overview Cards Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d1033] via-[#121024] to-[#0d0c1c] p-5 sm:p-6 border border-fuchsia-900/30 shadow-2xl shadow-purple-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 flex items-center gap-1">
                <CardIcon className="w-3 h-3" /> KREDİ KARTLARI ({cards.length})
              </span>
              <span className="text-xs text-slate-400">Otomatik Limit & Borç Takibi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {formatCurrency(totalDebts)}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Toplam Güncel Kart Borcu</p>
          </div>

          <button
            id="btn-add-new-card"
            onClick={onOpenNewCardModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-fuchsia-950/50 border border-fuchsia-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kart Ekle</span>
          </button>
        </div>

        {/* Limit Bar Overview */}
        <div className="mt-5 pt-4 border-t border-purple-900/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">
              Kullanılabilir Limit: <strong className="text-emerald-400 font-bold">{formatCurrency(totalAvailable)}</strong>
            </span>
            <span className="text-slate-400">
              Toplam Limit: <strong className="text-slate-200 font-bold">{formatCurrency(totalLimits)}</strong>
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalUsagePercentage > 80
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 shadow-sm shadow-rose-500'
                  : totalUsagePercentage > 50
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500'
              }`}
              style={{ width: `${totalUsagePercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Doluluk: %{totalUsagePercentage}</span>
            <span>{cards.length} Adet Aktif Kart</span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="space-y-4">
        {cards.length === 0 ? (
          <div className="bg-[#10101c] rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-fuchsia-900/30 border border-fuchsia-600/30 mx-auto flex items-center justify-center text-fuchsia-400">
              <CardIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Kayıtlı Kredi Kartı Yok</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Garanti, İş Bankası, Akbank veya diğer kartlarınızı ekleyerek otomatik limit & borç takibi başlatın.
            </p>
            <button
              onClick={onOpenNewCardModal}
              className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              + İlk Kartı Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cards.map((card) => {
              const theme = detectBankTheme(card.bankName || card.cardName);
              const availableLimit = Math.max(0, card.totalLimit - card.currentDebt);
              const usagePercent = card.totalLimit > 0 ? Math.min(100, Math.round((card.currentDebt / card.totalLimit) * 100)) : 0;
              const nextDueDate = getNextDueDayDate(card.dueDay);
              const daysLeft = getDaysDifference(nextDueDate);

              return (
                <div
                  key={card.id}
                  id={`card-item-${card.id}`}
                  className="rounded-3xl bg-[#10101c] border border-slate-800/90 overflow-hidden shadow-xl hover:border-purple-600/30 transition-all flex flex-col justify-between group"
                >
                  {/* Real Credit Card Visual Skin */}
                  <div
                    className={`relative p-5 text-white bg-gradient-to-tr ${theme.gradient} shadow-lg min-h-[190px] flex flex-col justify-between overflow-hidden`}
                  >
                    {/* Background geometric watermark patterns */}
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-black/20 blur-xl pointer-events-none" />

                    {/* Top Row: Bank Name / Logo & Contactless */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-wider uppercase drop-shadow-md">
                          {theme.logoText || card.bankName}
                        </span>
                        <span className="text-[10px] opacity-80 px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-md border border-white/20">
                          {card.cardName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-90">
                        <Wifi className="w-4 h-4 rotate-90" />
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Middle Row: EMV Chip & Card Number */}
                    <div className="relative z-10 my-2 flex items-center justify-between">
                      {/* Gold EMV Chip */}
                      <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border border-yellow-200 shadow-inner flex flex-col justify-around p-1">
                        <div className="w-full h-[1px] bg-amber-700/50" />
                        <div className="w-full h-[1px] bg-amber-700/50" />
                      </div>

                      {/* Number */}
                      <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-100 drop-shadow-md">
                        •••• •••• •••• {card.cardNumberLast4 || '0000'}
                      </div>
                    </div>

                    {/* Bottom Row: Cardholder, Cutoff & Due date */}
                    <div className="relative z-10 flex items-end justify-between text-xs pt-1 border-t border-white/15">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider opacity-75 block">Kart Sahibi</span>
                        <span className="font-bold tracking-wider uppercase text-xs truncate max-w-[140px] block">
                          {card.cardHolderName || 'KULLANICI'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] uppercase tracking-wider opacity-75 block">Son Ödeme</span>
                        <span className="font-bold font-mono text-xs text-yellow-200">
                          {formatDateShort(nextDueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Financial Details & Controls */}
                  <div className="p-4 space-y-3.5 bg-[#0f0f1c]">
                    {/* Urgency Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {daysLeft < 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Son Ödeme Gecikti ({Math.abs(daysLeft)} gün)
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-red-600/30 text-red-300 border border-red-500/50 animate-pulse flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Bugün Son Ödeme Günü!
                          </span>
                        ) : daysLeft <= 3 ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Son {daysLeft} Gün Kaldı
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {daysLeft} gün var (Ayın {card.dueDay}. günü)
                          </span>
                        )}
                      </div>

                      {/* Asgari Tutar */}
                      <span className="text-[11px] text-slate-400">
                        Asgari: <strong className="text-slate-200">{formatCurrency((card.currentDebt * (card.minPaymentRate || 20)) / 100)}</strong>
                      </span>
                    </div>

                    {/* Balance breakdown */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Güncel Borç</span>
                        <span className="text-sm font-extrabold text-rose-400">
                          {formatCurrency(card.currentDebt)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Kullanılabilir Limit</span>
                        <span className="text-sm font-extrabold text-emerald-400">
                          {formatCurrency(availableLimit)}
                        </span>
                      </div>
                    </div>

                    {/* Mini Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Limit: {formatCurrency(card.totalLimit)}</span>
                        <span>%{usagePercent} Dolu</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons: Pay Debt (Limit increases), Spend (Limit decreases), Edit, Delete */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Borç Öde (Otomatik Limit Artışı) */}
                      <button
                        onClick={() => onOpenPayDebtModal(card)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
                      >
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Borç Öde</span>
                      </button>

                      {/* Kartla Harcama Yap */}
                      <button
                        onClick={() => onOpenSpendCardModal(card)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold shadow-md shadow-purple-950/40 border border-purple-400/30 transition-all active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-200" />
                        <span>Harcama</span>
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditCard(card)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Kartı Düzenle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteCard(card.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Kartı Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
