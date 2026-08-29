import React, { useState, useMemo } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Receipt,
  CreditCard as CardIcon,
  Landmark,
  Plus,
} from 'lucide-react';
import { Transaction, Bill, CreditCard, Loan } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  bills: Bill[];
  cards: CreditCard[];
  loans: Loan[];
  onOpenNewTransactionForDate: (date: string) => void;
}

const MONTH_NAMES_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const DAY_NAMES_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  transactions,
  bills,
  cards,
  loans,
  onOpenNewTransactionForDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Calendar days grid generator
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // In JS, getDay() 0 is Sunday, 1 is Monday.
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6; // Sunday becomes 6

    const daysInMonth = lastDayOfMonth.getDate();
    const days: Array<{
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      hasIncome: boolean;
      hasExpense: boolean;
      hasDueBills: boolean;
      hasDueCardOrLoan: boolean;
    }> = [];

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const dayTxs = transactions.filter((tx) => tx.date === fullDateStr);
      const hasIncome = dayTxs.some((tx) => tx.type === 'income');
      const hasExpense = dayTxs.some((tx) => tx.type === 'expense');

      const hasDueBills = bills.some(
        (b) => !b.isPaid && (b.dueDate === fullDateStr || b.dueDay === d)
      );

      const hasDueCardOrLoan =
        cards.some((c) => c.dueDay === d && (c.currentDebt || 0) > 0) ||
        loans.some((l) => !l.isCompleted && l.nextDueDate === fullDateStr);

      days.push({
        dayNumber: d,
        dateStr: fullDateStr,
        isCurrentMonth: true,
        hasIncome,
        hasExpense,
        hasDueBills,
        hasDueCardOrLoan,
      });
    }

    return { startDayOfWeek, days };
  }, [currentYear, currentMonth, transactions, bills, cards, loans]);

  // Selected date details
  const selectedDateTxs = useMemo(() => {
    return transactions.filter((tx) => tx.date === selectedDateStr);
  }, [transactions, selectedDateStr]);

  const selectedDayNumber = useMemo(() => {
    const parts = selectedDateStr.split('-');
    return parseInt(parts[2], 10) || 0;
  }, [selectedDateStr]);

  const selectedDateBills = useMemo(() => {
    return bills.filter(
      (b) => b.dueDate === selectedDateStr || (!b.isPaid && b.dueDay === selectedDayNumber)
    );
  }, [bills, selectedDateStr, selectedDayNumber]);

  const selectedDateCards = useMemo(() => {
    return cards.filter((c) => c.dueDay === selectedDayNumber && (c.currentDebt || 0) > 0);
  }, [cards, selectedDayNumber]);

  const selectedDateLoans = useMemo(() => {
    return loans.filter((l) => !l.isCompleted && l.nextDueDate === selectedDateStr);
  }, [loans, selectedDateStr]);

  const dayTotalIncome = selectedDateTxs
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const dayTotalExpense = selectedDateTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#111122] border border-purple-800/40 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-500 p-[1.5px]">
              <div className="w-full h-full bg-[#111122] rounded-[14px] flex items-center justify-center text-purple-300">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                Finans Takvimi & Günlük Ajanda
              </h3>
              <p className="text-xs text-slate-400">
                Günün kasa hareketleri ve vadesi gelen borçlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 text-xs font-bold border border-purple-600/40 transition-colors"
            >
              Bugün
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <h4 className="text-sm sm:text-base font-extrabold text-white">
              {MONTH_NAMES_TR[currentMonth]} {currentYear}
            </h4>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#0e0e1a] p-3 sm:p-4 rounded-2xl border border-slate-800/80">
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAY_NAMES_TR.map((dayName) => (
                <span
                  key={dayName}
                  className="text-[11px] font-bold text-slate-400 py-1"
                >
                  {dayName}
                </span>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: calendarDays.startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
              ))}

              {/* Day cells */}
              {calendarDays.days.map((item) => {
                const isSelected = item.dateStr === selectedDateStr;
                const isToday = item.dateStr === todayStr;

                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDateStr(item.dateStr)}
                    className={`h-10 sm:h-12 rounded-xl p-1 flex flex-col items-center justify-between transition-all relative ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50 font-bold scale-[1.03] z-10'
                        : isToday
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 font-bold'
                        : 'bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 border border-slate-800/50'
                    }`}
                  >
                    <span className="text-xs leading-none mt-0.5">{item.dayNumber}</span>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-0.5 mb-0.5">
                      {item.hasIncome && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Gelir" />
                      )}
                      {item.hasExpense && (
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400" title="Gider" />
                      )}
                      {item.hasDueBills && (
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400" title="Fatura Vadesi" />
                      )}
                      {item.hasDueCardOrLoan && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Kart/Kredi Vadesi" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400" /> Gelir
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-rose-400" /> Gider
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-pink-400" /> Fatura Son Günü
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" /> Kart / Kredi Taksiti
              </span>
            </div>
          </div>

          {/* Selected Day Agenda Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#18112e] to-[#0e0e1c] border border-purple-700/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/40 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                  Seçilen Gün Özeti
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  {formatDate(selectedDateStr)}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    +{formatCurrency(dayTotalIncome)}
                  </span>
                  <span className="text-[10px] text-rose-400 font-bold block">
                    -{formatCurrency(dayTotalExpense)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    onOpenNewTransactionForDate(selectedDateStr);
                    onClose();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>İşlem Ekle</span>
                </button>
              </div>
            </div>

            {/* Day Transactions */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-300">
                Günün Kasa İşlemleri ({selectedDateTxs.length})
              </h5>

              {selectedDateTxs.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Bu tarihte henüz bir işlem girilmemiş.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedDateTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {tx.type === 'income' ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className="font-semibold text-slate-200 truncate">
                          {tx.description || tx.category}
                        </span>
                        <span className="text-[10px] text-slate-500">({tx.paymentSource})</span>
                      </div>
                      <span
                        className={`font-extrabold shrink-0 ml-2 ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Day Reminders & Due Items */}
            {(selectedDateBills.length > 0 ||
              selectedDateCards.length > 0 ||
              selectedDateLoans.length > 0) && (
              <div className="space-y-2 pt-2 border-t border-purple-900/30">
                <h5 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Bu Gün Vadesi / Son Ödemesi Olanlar
                </h5>

                <div className="space-y-1.5">
                  {selectedDateBills.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-pink-950/30 border border-pink-800/40 text-xs"
                    >
                      <span className="flex items-center gap-1.5 text-pink-300 font-medium truncate">
                        <Receipt className="w-3.5 h-3.5 shrink-0" />
                        {b.title}
                      </span>
                      <span className="font-extrabold text-pink-300 shrink-0">
                        {formatCurrency(b.amount)} {b.isPaid && '(Ödendi)'}
                      </span>
                    </div>
                  ))}

                  {selectedDateCards.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-fuchsia-950/30 border border-fuchsia-800/40 text-xs"
                    >
                      <span className="flex items-center gap-1.5 text-fuchsia-300 font-medium truncate">
                        <CardIcon className="w-3.5 h-3.5 shrink-0" />
                        {c.bankName} - {c.cardName} (Son Ödeme)
                      </span>
                      <span className="font-extrabold text-fuchsia-300 shrink-0">
                        {formatCurrency(c.currentDebt)}
                      </span>
                    </div>
                  ))}

                  {selectedDateLoans.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs"
                    >
                      <span className="flex items-center gap-1.5 text-amber-300 font-medium truncate">
                        <Landmark className="w-3.5 h-3.5 shrink-0" />
                        {l.bankName} - {l.loanTitle} Taksiti
                      </span>
                      <span className="font-extrabold text-amber-300 shrink-0">
                        {formatCurrency(l.monthlyInstallment)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
