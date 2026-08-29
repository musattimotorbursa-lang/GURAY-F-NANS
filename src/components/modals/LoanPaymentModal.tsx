import React, { useState } from 'react';
import { X, TrendingDown, Banknote, Landmark, CheckCircle2 } from 'lucide-react';
import { Loan, PaymentSource, BankAccount } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface LoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  bankAccounts?: BankAccount[];
  onConfirmPayment: (
    loanId: string,
    amount: number,
    source: PaymentSource,
    bankName?: string,
    bankAccountId?: string
  ) => void;
}

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
  isOpen,
  onClose,
  loan,
  bankAccounts = [],
  onConfirmPayment,
}) => {
  const [payAmount, setPayAmount] = useState<string>('');
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('bank');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>(
    bankAccounts[0]?.id || ''
  );
  const [bankName, setBankName] = useState<string>(
    bankAccounts[0]?.bankName || 'Garanti BBVA'
  );

  if (!isOpen || !loan) return null;

  const currentMonthly = loan.monthlyInstallment || 0;
  const initialAmt = payAmount ? parseFloat(payAmount) : currentMonthly;
  const selectedBankAcc = bankAccounts.find((b) => b.id === selectedBankAccountId);

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount.replace(',', '.')) || currentMonthly;
    if (isNaN(amountNum) || amountNum <= 0) return;

    const chosenBankName =
      paymentSource === 'bank'
        ? selectedBankAcc
          ? `${selectedBankAcc.bankName} (${selectedBankAcc.accountName})`
          : bankName
        : undefined;

    onConfirmPayment(
      loan.id,
      amountNum,
      paymentSource,
      chosenBankName,
      paymentSource === 'bank' ? selectedBankAccountId || undefined : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#11111f] border border-amber-700/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Kredi Taksiti Öde</h3>
            <p className="text-xs text-slate-400">{loan.bankName} - {loan.loanTitle}</p>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Sıradaki Taksit:</span>
            <span className="text-emerald-400 font-bold">
              {loan.paidInstallments + 1}. Taksit / {loan.totalInstallments}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Aylık Taksit Tutarı:</span>
            <span className="text-white font-extrabold">{formatCurrency(loan.monthlyInstallment)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Kalan Toplam Borç:</span>
            <span className="text-amber-400 font-bold">{formatCurrency(loan.remainingDebt)}</span>
          </div>
          {loan.nextDueDate && (
            <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400">Vade Tarihi:</span>
              <span className="text-yellow-300 font-bold">{formatDate(loan.nextDueDate)}</span>
            </div>
          )}
        </div>

        <form onSubmit={handlePay} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Ödenecek Tutar (₺) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              defaultValue={currentMonthly}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder={currentMonthly.toString()}
              className="w-full text-xl font-extrabold px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Ödendiğinde kalan kredi borcundan ve taksit sayısından otomatik düşülecektir.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Ödeme Nereden Çıkacak?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentSource('bank')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentSource === 'bank'
                    ? 'bg-sky-600/30 text-sky-300 border-sky-500 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" /> Banka Hesabından
              </button>

              <button
                type="button"
                onClick={() => setPaymentSource('cash')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  paymentSource === 'cash'
                    ? 'bg-amber-600/30 text-amber-300 border-amber-500 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" /> Nakit Kasadan Düş
              </button>
            </div>
          </div>

          {paymentSource === 'bank' && bankAccounts.length > 0 && (
            <div className="p-3 bg-sky-950/30 border border-sky-800/40 rounded-2xl space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-sky-300">
                Ödemenin Yapılacağı Banka Hesabı:
              </label>
              <select
                value={selectedBankAccountId}
                onChange={(e) => {
                  setSelectedBankAccountId(e.target.value);
                  const b = bankAccounts.find((acc) => acc.id === e.target.value);
                  if (b) setBankName(b.bankName);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 font-semibold"
              >
                {bankAccounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bankName} - {b.accountName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-amber-950/50 transition-all active:scale-[0.98]"
          >
            Taksiti Öde & Borcu Düş ({formatCurrency(initialAmt)})
          </button>
        </form>
      </div>
    </div>
  );
};
