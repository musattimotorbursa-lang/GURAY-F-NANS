import React, { useState } from 'react';
import {
  Plus,
  Receipt,
  Zap,
  Droplets,
  Flame,
  Wifi,
  Phone,
  Home,
  Building,
  Tv,
  ShoppingCart,
  Fuel,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Trash2,
  Edit2,
  RotateCw,
  Tags,
} from 'lucide-react';
import { Bill, BillCategory } from '../types';
import { formatCurrency, getDaysDifference, formatDate } from '../utils/formatters';

interface BillsViewProps {
  bills: Bill[];
  onOpenNewBillModal: () => void;
  onEditBill: (bill: Bill) => void;
  onDeleteBill: (id: string) => void;
  onPayBill: (bill: Bill) => void;
  onResetBillStatus: (bill: Bill) => void;
  onOpenCategoryManager?: () => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  bills,
  onOpenNewBillModal,
  onEditBill,
  onDeleteBill,
  onPayBill,
  onResetBillStatus,
  onOpenCategoryManager,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (cat: BillCategory) => {
    switch (cat) {
      case 'phone':
        return <Phone className="w-4 h-4 text-emerald-400" />;
      case 'internet':
        return <Wifi className="w-4 h-4 text-cyan-400" />;
      case 'dues':
        return <Building className="w-4 h-4 text-indigo-400" />;
      case 'electricity':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'water':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'gas':
        return <Flame className="w-4 h-4 text-orange-400" />;
      case 'rent':
        return <Home className="w-4 h-4 text-purple-400" />;
      case 'market':
        return <ShoppingCart className="w-4 h-4 text-lime-400" />;
      case 'fuel':
        return <Fuel className="w-4 h-4 text-amber-500" />;
      case 'subscription':
        return <Tv className="w-4 h-4 text-pink-400" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryName = (cat: BillCategory) => {
    switch (cat) {
      case 'phone':
        return 'Telefon';
      case 'internet':
        return 'İnternet';
      case 'dues':
        return 'Aidat';
      case 'electricity':
        return 'Elektrik';
      case 'water':
        return 'Su';
      case 'gas':
        return 'Doğalgaz';
      case 'rent':
        return 'Kira';
      case 'market':
        return 'Market';
      case 'fuel':
        return 'Akaryakıt';
      case 'subscription':
        return 'Abonelik';
      default:
        return 'Diğer Gider';
    }
  };

  const filteredBills = bills.filter(
    (b) => selectedCategory === 'all' || b.category === selectedCategory
  );

  const totalMonthlyBills = bills.reduce((acc, b) => acc + (b.amount || 0), 0);
  const pendingBills = bills.filter((b) => !b.isPaid);
  const totalPendingAmount = pendingBills.reduce((acc, b) => acc + (b.amount || 0), 0);
  const paidBills = bills.filter((b) => b.isPaid);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
      {/* Overview Bills Header - ISOLATED BILL METRICS ONLY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1325] via-[#1a0f1c] to-[#0d0c1c] p-5 sm:p-6 border border-pink-900/30 shadow-2xl shadow-pink-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 flex items-center gap-1">
                <Receipt className="w-3 h-3" /> FATURALAR & SABİT GİDERLER
              </span>
              <span className="text-xs text-slate-400">Alarm & Vade Takibi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {formatCurrency(totalPendingAmount)}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ödenmeyi Bekleyen Toplam Fatura ({pendingBills.length} Fatura)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCategoryManager && (
              <button
                onClick={onOpenCategoryManager}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 transition-colors"
                title="Kategorileri Düzenle / Ekle / Sil"
              >
                <Tags className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Kategori Yönetimi</span>
              </button>
            )}

            <button
              id="btn-add-new-bill"
              onClick={onOpenNewBillModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-pink-950/50 border border-pink-400/40 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Fatura / Gider Ekle</span>
            </button>
          </div>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-pink-900/30">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[10px] sm:text-xs text-slate-400 font-medium block">
              Aylık Toplam Yük
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-slate-200 mt-0.5 block truncate">
              {formatCurrency(totalMonthlyBills)}
            </span>
          </div>

          <div className="bg-rose-950/30 p-3 rounded-2xl border border-rose-800/30">
            <span className="text-[10px] sm:text-xs text-rose-300 font-medium block">
              Bekleyen ({pendingBills.length})
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-rose-400 mt-0.5 block truncate">
              {formatCurrency(totalPendingAmount)}
            </span>
          </div>

          <div className="bg-emerald-950/30 p-3 rounded-2xl border border-emerald-800/30">
            <span className="text-[10px] sm:text-xs text-emerald-300 font-medium block">
              Ödenen ({paidBills.length})
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-emerald-400 mt-0.5 block truncate">
              {formatCurrency(totalMonthlyBills - totalPendingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-pink-600 text-white shadow-md'
              : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          Tüm Faturalar ({bills.length})
        </button>
        {[
          'phone',
          'internet',
          'dues',
          'electricity',
          'gas',
          'water',
          'rent',
          'market',
          'fuel',
          'subscription',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
              selectedCategory === cat
                ? 'bg-pink-600/30 text-pink-300 border border-pink-500/50 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {getCategoryIcon(cat as BillCategory)}
            <span>{getCategoryName(cat as BillCategory)}</span>
          </button>
        ))}
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <div className="bg-[#10101c] rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-pink-900/30 border border-pink-600/30 mx-auto flex items-center justify-center text-pink-400">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Fatura Bulunamadı</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Telefon, internet, elektrik, su, doğalgaz veya aidatlarınızı ekleyerek son ödeme alarmlarını kurun.
            </p>
            <button
              onClick={onOpenNewBillModal}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              + Yeni Fatura Ekle
            </button>
          </div>
        ) : (
          filteredBills.map((bill) => {
            const daysLeft = bill.dueDate ? getDaysDifference(bill.dueDate) : 999;

            return (
              <div
                key={bill.id}
                id={`bill-item-${bill.id}`}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-3 ${
                  bill.isPaid
                    ? 'bg-slate-900/30 border-slate-800/80 opacity-80'
                    : 'bg-[#10101c] border-slate-800 hover:border-pink-800/40 shadow-sm'
                }`}
              >
                {/* Left: Icon, Title & Category */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      bill.isPaid
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                    }`}
                  >
                    {getCategoryIcon(bill.category)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100 truncate">{bill.title}</h4>
                      {bill.isPaid && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ÖDENDİ {bill.paidWithSource ? `(${bill.paidWithSource === 'bank' ? 'Banka' : bill.paidWithSource === 'card' ? 'Kart' : 'Nakit'})` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="text-slate-300 font-medium">
                        {getCategoryName(bill.category)}
                      </span>
                      <span>•</span>
                      <span>Son Gün: Ayın {bill.dueDay}. günü</span>
                      {bill.notes && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 truncate max-w-[150px]">
                            {bill.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Alarm Status & Pay Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-extrabold text-white block">
                      {formatCurrency(bill.amount)}
                    </span>

                    {/* Due Date Alarm Status Badge */}
                    {!bill.isPaid && bill.dueDate && (
                      <div>
                        {daysLeft < 0 ? (
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {Math.abs(daysLeft)} gün gecikti!
                          </span>
                        ) : daysLeft === 0 ? (
                          <span className="text-[11px] font-extrabold text-red-400 flex items-center gap-1 animate-pulse">
                            <AlertCircle className="w-3 h-3" /> Bugün Son Gün!
                          </span>
                        ) : daysLeft <= 3 ? (
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {daysLeft} gün kaldı
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {formatDate(bill.dueDate)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {!bill.isPaid ? (
                      <button
                        onClick={() => onPayBill(bill)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/30 transition-all active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Öde</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onResetBillStatus(bill)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                        title="Ödenmedi Olarak Geri Al / Yeni Aya Başlat"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Sıfırla</span>
                      </button>
                    )}

                    <button
                      onClick={() => onEditBill(bill)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Faturayı Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Faturayı Sil"
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

