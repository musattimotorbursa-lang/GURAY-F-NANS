import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Bell,
  Database,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard as CardIcon,
  Landmark,
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { CashbookStats, DueAlarmItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  stats: CashbookStats;
  alarms: DueAlarmItem[];
  activeTab: 'cashbook' | 'cards' | 'bank_accounts' | 'loans' | 'bills' | 'stats';
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenAlarms: () => void;
  onOpenCalendar: () => void;
  onOpenBackup: () => void;
  onNewTransaction: (type: 'income' | 'expense') => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  alarms,
  activeTab,
  theme,
  onToggleTheme,
  onOpenAlarms,
  onOpenCalendar,
  onOpenBackup,
  onNewTransaction,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const urgentAlarmCount = alarms.filter(
    (a) => a.status === 'overdue' || a.status === 'today' || a.status === 'urgent'
  ).length;

  // Format Turkish Date and Time
  const formattedDateStr = currentTime.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });

  const formattedTimeStr = currentTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c16]/90 backdrop-blur-xl border-b border-purple-900/30">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
        {/* Top bar: Brand & Action icons */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-emerald-400 p-[1.5px] shadow-lg shadow-purple-500/20 shrink-0 overflow-hidden">
              <img
                src="/icon.png"
                alt="Logo"
                className="w-full h-full object-cover rounded-[9px]"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              {/* Neon Glow Dot */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full blur-[2px] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-200 to-emerald-300 tracking-tight">
                  Kasa & Finans
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Devirli Kasa, Kart, Banka & Kredi Takibi
              </p>
            </div>
          </div>

          {/* Right Action Icons: Live Date/Time with Calendar Trigger, Theme, Alarms, Backup */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Day / Night Theme Toggle Button (Icon only) */}
            <button
              id="header-theme-toggle-btn"
              onClick={onToggleTheme}
              className={`p-2.5 rounded-xl flex items-center justify-center border transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
                theme === 'dark'
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30 hover:border-amber-500/50 shadow-amber-950/40'
                  : 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-700 border-indigo-200 hover:border-indigo-300'
              }`}
              title={theme === 'dark' ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-[spin_12s_linear_infinite]" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 fill-indigo-600/30" />
              )}
            </button>

            {/* Live Date & Time Button (Click opens Calendar) */}
            <button
              id="header-calendar-btn"
              onClick={onOpenCalendar}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 hover:from-purple-900/80 hover:to-indigo-900/80 text-white text-xs font-bold border border-purple-600/40 shadow-md shadow-purple-950/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              title="Tarih & Saate Tıklayarak Takvimi Açın"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 text-left leading-tight">
                <span className="text-[11px] sm:text-xs text-purple-200 font-bold">
                  {formattedDateStr}
                </span>
                <span className="text-[10px] sm:text-xs text-emerald-400 font-mono font-extrabold flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 hidden sm:inline opacity-70" />
                  {formattedTimeStr}
                </span>
              </div>
            </button>

            {/* Alarm Button with Badge */}
            <button
              id="header-alarm-btn"
              onClick={onOpenAlarms}
              className="relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all hover:scale-105 active:scale-95"
              title="Ödeme Hatırlatıcıları & Alarmlar"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {urgentAlarmCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-gradient-to-r from-rose-600 to-orange-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-[#0c0c16] animate-bounce">
                  {urgentAlarmCount}
                </span>
              )}
            </button>

            {/* Backup / Restore Button */}
            <button
              id="header-backup-btn"
              onClick={onOpenBackup}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all hover:scale-105 active:scale-95"
              title="Veri Yedekleme & Geri Yükleme"
            >
              <Database className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Quick Balance Ticker - ONLY on Cashbook Tab */}
        {activeTab === 'cashbook' && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 animate-fadeIn">
            {/* Net Kasa (Devirli) */}
            <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-950/80 p-2.5 rounded-xl border border-purple-800/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Devirli Kasa</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 tracking-tight truncate">
                {formatCurrency(stats.netCashBalance)}
              </div>
            </div>

            {/* Banka Bakiyesi */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-950/80 p-2.5 rounded-xl border border-blue-800/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Banka Hesabı</span>
                <Landmark className="w-3 h-3 text-sky-400" />
              </div>
              <div className="text-sm sm:text-base font-bold text-sky-300 mt-0.5 tracking-tight truncate">
                {formatCurrency(stats.totalBankBalance)}
              </div>
            </div>

            {/* Kart Borçları */}
            <div className="bg-gradient-to-br from-rose-950/30 via-slate-900/60 to-slate-950/80 p-2.5 rounded-xl border border-rose-800/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Kart Borçları</span>
                <CardIcon className="w-3 h-3 text-rose-400" />
              </div>
              <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5 tracking-tight truncate">
                {formatCurrency(stats.totalCreditCardDebt)}
              </div>
            </div>

            {/* Kredi Borçları */}
            <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/60 to-slate-950/80 p-2.5 rounded-xl border border-amber-800/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">Kredi Borçları</span>
                <span className="text-[10px] text-amber-400 font-bold">Vade</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5 tracking-tight truncate">
                {formatCurrency(stats.totalLoanDebt)}
              </div>
            </div>
          </div>
        )}

        {/* Quick Income / Expense Actions */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            id="quick-income-btn"
            onClick={() => onNewTransaction('income')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/30 active:scale-[0.98] transition-all"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-200" />
            <span>Gelir Ekle (+)</span>
          </button>

          <button
            id="quick-expense-btn"
            onClick={() => onNewTransaction('expense')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600/90 to-orange-600/90 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 border border-rose-400/30 active:scale-[0.98] transition-all"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-200" />
            <span>Gider Ekle (-)</span>
          </button>
        </div>
      </div>
    </header>
  );
};

