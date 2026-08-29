import React from 'react';
import {
  Plus,
  Landmark,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  TrendingDown,
  Percent,
} from 'lucide-react';
import { Loan } from '../types';
import { formatCurrency, getDaysDifference, formatDate } from '../utils/formatters';

interface LoansViewProps {
  loans: Loan[];
  onOpenNewLoanModal: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onOpenPayInstallmentModal: (loan: Loan) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  loans,
  onOpenNewLoanModal,
  onEditLoan,
  onDeleteLoan,
  onOpenPayInstallmentModal,
}) => {
  const activeLoans = loans.filter((l) => !l.isCompleted);
  const completedLoans = loans.filter((l) => l.isCompleted);

  const totalRemainingDebt = activeLoans.reduce((acc, l) => acc + (l.remainingDebt || 0), 0);
  const totalMonthlyLoad = activeLoans.reduce((acc, l) => acc + (l.monthlyInstallment || 0), 0);
  const totalPaidSoFar = loans.reduce(
    (acc, l) => acc + (l.paidInstallments || 0) * (l.monthlyInstallment || 0),
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
      {/* Overview Loans Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1708] via-[#1a120b] to-[#0d0c1c] p-5 sm:p-6 border border-amber-900/30 shadow-2xl shadow-amber-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Landmark className="w-3 h-3" /> KREDİ & TAKSİT TAKİBİ
              </span>
              <span className="text-xs text-slate-400">Otomatik Borç Düşümü</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {formatCurrency(totalRemainingDebt)}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Toplam Kalan Kredi Borcu</p>
          </div>

          <button
            id="btn-add-new-loan"
            onClick={onOpenNewLoanModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-lg shadow-amber-950/50 border border-amber-400/40 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kredi Ekle</span>
          </button>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-amber-900/30">
          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Aylık Taksit Yükü</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-400 mt-0.5 block truncate">
              {formatCurrency(totalMonthlyLoad)} / ay
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">Bugüne Kadar Ödenen</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-400 mt-0.5 block truncate">
              {formatCurrency(totalPaidSoFar)}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium block">Aktif Kredi Sayısı</span>
            <span className="text-sm sm:text-base font-extrabold text-slate-200 mt-0.5 block">
              {activeLoans.length} Aktif {completedLoans.length > 0 && `(${completedLoans.length} Kapandı)`}
            </span>
          </div>
        </div>
      </div>

      {/* Active Loans List */}
      <div className="space-y-4">
        {loans.length === 0 ? (
          <div className="bg-[#10101c] rounded-2xl p-8 text-center border border-dashed border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-900/30 border border-amber-600/30 mx-auto flex items-center justify-center text-amber-400">
              <Landmark className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">Kayıtlı Kredi Bulunmuyor</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              İhtiyaç, konut veya araç kredilerinizi ekleyerek taksit ödedikçe otomatik borç düşümünü izleyin.
            </p>
            <button
              onClick={onOpenNewLoanModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              + İlk Krediyi Ekle
            </button>
          </div>
        ) : (
          loans.map((loan) => {
            const progressPercent =
              loan.totalInstallments > 0
                ? Math.min(100, Math.round((loan.paidInstallments / loan.totalInstallments) * 100))
                : 0;

            const daysLeft = loan.nextDueDate ? getDaysDifference(loan.nextDueDate) : 999;
            const remainingInstallments = Math.max(0, loan.totalInstallments - loan.paidInstallments);

            return (
              <div
                key={loan.id}
                id={`loan-item-${loan.id}`}
                className={`rounded-3xl p-5 border transition-all shadow-lg ${
                  loan.isCompleted
                    ? 'bg-slate-900/40 border-slate-800 opacity-80'
                    : 'bg-[#10101c] border-slate-800 hover:border-amber-700/40'
                }`}
              >
                {/* Header: Title, Bank & Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-100">{loan.loanTitle}</h3>
                        {loan.isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> TAMAMLANDI
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{loan.bankName}</p>
                    </div>
                  </div>

                  {/* Due date urgency badge */}
                  {!loan.isCompleted && loan.nextDueDate && (
                    <div>
                      {daysLeft < 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Vadesi Gecikti ({Math.abs(daysLeft)} gün)
                        </span>
                      ) : daysLeft === 0 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/50 animate-pulse flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> Bugün Taksit Günü!
                        </span>
                      ) : daysLeft <= 3 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {daysLeft} Gün Kaldı
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {formatDate(loan.nextDueDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Financial Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Kalan Toplam Borç</span>
                    <span className="text-sm font-extrabold text-amber-400">
                      {formatCurrency(loan.remainingDebt)}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Aylık Taksit Tutarı</span>
                    <span className="text-sm font-extrabold text-slate-100">
                      {formatCurrency(loan.monthlyInstallment)}
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Ödenen / Toplam Taksit</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {loan.paidInstallments} / {loan.totalInstallments} Taksit
                    </span>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Kalan Taksit</span>
                    <span className="text-sm font-extrabold text-slate-200">
                      {remainingInstallments} Ay Kaldı
                    </span>
                  </div>
                </div>

                {/* Progress Bar of Installments */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>İlerleme (%{progressPercent})</span>
                    <span>
                      Ödenen: {formatCurrency(loan.paidInstallments * loan.monthlyInstallment)} / {formatCurrency(loan.totalRepayment)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        loan.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Notes if any */}
                {loan.notes && (
                  <p className="text-xs text-slate-400 mb-4 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60 italic">
                    📌 {loan.notes}
                  </p>
                )}

                {/* Actions: Pay Installment (Auto Decreases Debt & Installment count), Edit, Delete */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  {!loan.isCompleted ? (
                    <button
                      onClick={() => onOpenPayInstallmentModal(loan)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-950/40 border border-amber-400/30 transition-all active:scale-95"
                    >
                      <TrendingDown className="w-4 h-4 text-amber-200" />
                      <span>Taksit Öde (Otomatik Borç Düş)</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2 px-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Kredi Başarıyla Kapatıldı
                    </div>
                  )}

                  <button
                    onClick={() => onEditLoan(loan)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Krediyi Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteLoan(loan.id)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Krediyi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
