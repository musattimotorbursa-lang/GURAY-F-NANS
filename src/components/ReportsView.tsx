import React from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CreditCard,
  Landmark,
  Receipt,
  Wallet,
  AlertTriangle,
} from 'lucide-react';
import { CashbookStats, Transaction, CreditCard as CardType, Loan, Bill } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ReportsViewProps {
  stats: CashbookStats;
  transactions: Transaction[];
  cards: CardType[];
  loans: Loan[];
  bills: Bill[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  stats,
  transactions,
  cards,
  loans,
  bills,
}) => {
  // Category breakdown calculation
  const expenseCategories: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense' && !tx.isDevir)
    .forEach((tx) => {
      expenseCategories[tx.category] = (expenseCategories[tx.category] || 0) + tx.amount;
    });

  const sortedCategories: [string, number][] = Object.entries(expenseCategories)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 6) as [string, number][];

  const totalExpenseSum = Object.values(expenseCategories).reduce((a: number, b: number) => a + b, 0);

  // 30 Days Upcoming cash requirements
  const pendingBillSum = bills.filter((b) => !b.isPaid).reduce((acc, b) => acc + (b.amount || 0), 0);
  const monthlyLoanSum = loans.filter((l) => !l.isCompleted).reduce((acc, l) => acc + (l.monthlyInstallment || 0), 0);
  const minCardPaymentSum = cards.reduce(
    (acc, c) => acc + (c.currentDebt * (c.minPaymentRate || 20)) / 100,
    0
  );
  const totalUpcoming30Days = pendingBillSum + monthlyLoanSum + minCardPaymentSum;
  const liquidAssets = stats.netCashBalance + stats.totalBankBalance;
  const liquidityGap = liquidAssets - totalUpcoming30Days;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
      {/* Net Worth Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c113b] via-[#121029] to-[#0d0c1c] p-6 border border-purple-800/40 shadow-2xl shadow-purple-950/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1.5 w-fit">
              <ShieldCheck className="w-3.5 h-3.5" /> NET FİNANSAL VARLIK & SAĞLIK
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-black mt-2 tracking-tight ${
                stats.netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(stats.netWorth)}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              (Nakit Kasa + Banka) - (Kredi Kartı Borçları + Kredi Borçları)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-right">
            <span className="text-xs text-slate-400 block font-medium">Toplam Likit Varlık</span>
            <span className="text-lg font-black text-emerald-400 block">
              {formatCurrency(liquidAssets)}
            </span>
            <span className="text-[11px] text-slate-500">Kasa: {formatCurrency(stats.netCashBalance)} | Banka: {formatCurrency(stats.totalBankBalance)}</span>
          </div>
        </div>

        {/* 30-Day Liquidity Forecast Alert */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Önümüzdeki 30 Günlük Asgari Nakit İhtiyacı:
            </span>
            <span className="text-sm font-extrabold text-amber-400">
              {formatCurrency(totalUpcoming30Days)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400 pt-1">
            <div>• Kredi Taksitleri: <strong className="text-slate-200">{formatCurrency(monthlyLoanSum)}</strong></div>
            <div>• Faturalar: <strong className="text-slate-200">{formatCurrency(pendingBillSum)}</strong></div>
            <div>• Kart Asgarileri: <strong className="text-slate-200">{formatCurrency(minCardPaymentSum)}</strong></div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Likit Karşılama Durumu:</span>
            <span className={`font-bold ${liquidityGap >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {liquidityGap >= 0
                ? `+${formatCurrency(liquidityGap)} Fazla Likidite (Güvenli)`
                : `${formatCurrency(Math.abs(liquidityGap))} Açık Var (Dikkat!)`}
            </span>
          </div>
        </div>
      </div>

      {/* Top Expense Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expense Categories */}
        <div className="bg-[#10101c] p-5 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-purple-400" />
            En Çok Harcanan Kategoriler
          </h3>

          {sortedCategories.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Henüz harcama kaydı yok</p>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([category, amount], idx) => {
                const percent = totalExpenseSum > 0 ? Math.round((amount / totalExpenseSum) * 100) : 0;
                const colors = [
                  'bg-purple-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-fuchsia-500',
                  'bg-sky-500',
                  'bg-rose-500',
                ];

                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{category}</span>
                      <span className="text-slate-400">
                        {formatCurrency(amount)} (%{percent})
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[idx % colors.length]}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Balance & Debt Distribution */}
        <div className="bg-[#10101c] p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            Borç Dağılımı ve Yükü
          </h3>

          <div className="space-y-3">
            {/* Credit Card Total Debt */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Kredi Kartı Borçları</span>
                  <span className="text-[10px] text-slate-400">{cards.length} Adet Kart</span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-rose-400">
                {formatCurrency(stats.totalCreditCardDebt)}
              </span>
            </div>

            {/* Loan Total Debt */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Kredi Borçları</span>
                  <span className="text-[10px] text-slate-400">Kalan Ana Para + Faiz</span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-amber-400">
                {formatCurrency(stats.totalLoanDebt)}
              </span>
            </div>

            {/* Bills Pending */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Bekleyen Faturalar</span>
                  <span className="text-[10px] text-slate-400">Aylık Sabit Yük</span>
                </div>
              </div>
              <span className="text-sm font-extrabold text-pink-400">
                {formatCurrency(stats.totalPendingBills)}
              </span>
            </div>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500">
            Tüm hesaplamalar yerel şifrelenmiş veri tabanında gerçek zamanlı güncellenir.
          </div>
        </div>
      </div>
    </div>
  );
};
