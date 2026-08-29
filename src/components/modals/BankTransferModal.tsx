import React, { useState } from 'react';
import {
  X,
  ArrowRightLeft,
  Landmark,
  Banknote,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { BankAccount, PaymentSource } from '../../types';
import { formatCurrency, getTodayString } from '../../utils/formatters';

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
  cashBalance: number;
  onExecuteTransfer: (data: {
    type: 'cash_to_bank' | 'bank_to_cash' | 'bank_to_bank';
    fromBankAccountId?: string;
    toBankAccountId?: string;
    amount: number;
    description: string;
    date: string;
  }) => void;
}

export const BankTransferModal: React.FC<BankTransferModalProps> = ({
  isOpen,
  onClose,
  bankAccounts,
  cashBalance,
  onExecuteTransfer,
}) => {
  const [transferType, setTransferType] = useState<
    'cash_to_bank' | 'bank_to_cash' | 'bank_to_bank'
  >('bank_to_bank');
  const [fromBankId, setFromBankId] = useState<string>(bankAccounts[0]?.id || '');
  const [toBankId, setToBankId] = useState<string>(
    bankAccounts.length > 1 ? bankAccounts[1]?.id : bankAccounts[0]?.id || ''
  );
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayString());

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) return;

    let desc = description.trim();
    if (!desc) {
      if (transferType === 'cash_to_bank') {
        const targetBank = bankAccounts.find((b) => b.id === toBankId);
        desc = `Kasadan ${targetBank?.bankName || 'Banka'} Hesabına Nakit Yatırma`;
      } else if (transferType === 'bank_to_cash') {
        const sourceBank = bankAccounts.find((b) => b.id === fromBankId);
        desc = `${sourceBank?.bankName || 'Banka'} Hesabından Kasaya Nakit Çekme`;
      } else {
        const sourceBank = bankAccounts.find((b) => b.id === fromBankId);
        const targetBank = bankAccounts.find((b) => b.id === toBankId);
        desc = `${sourceBank?.bankName || 'Banka 1'} ➔ ${targetBank?.bankName || 'Banka 2'} Virman Transferi`;
      }
    }

    onExecuteTransfer({
      type: transferType,
      fromBankAccountId: transferType !== 'cash_to_bank' ? fromBankId : undefined,
      toBankAccountId: transferType !== 'bank_to_cash' ? toBankId : undefined,
      amount: amountNum,
      description: desc,
      date,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#101020] border border-sky-700/50 p-5 sm:p-6 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Hesaplar Arası Transfer</h3>
            <p className="text-xs text-slate-400">Kasa ve bankalarınız arasında bakiye aktarımı yapın</p>
          </div>
        </div>

        {/* Transfer Mode Selector */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <button
            type="button"
            onClick={() => setTransferType('bank_to_bank')}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              transferType === 'bank_to_bank'
                ? 'bg-sky-600/30 text-sky-200 border-sky-400 shadow-lg shadow-sky-950/40 scale-[1.02]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Landmark className="w-4 h-4 text-sky-400" />
            <span>Banka ➔ Banka</span>
            <span className="text-[9px] text-slate-500 font-normal">Virman</span>
          </button>

          <button
            type="button"
            onClick={() => setTransferType('cash_to_bank')}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              transferType === 'cash_to_bank'
                ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400 shadow-lg shadow-emerald-950/40 scale-[1.02]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Kasa ➔ Banka</span>
            <span className="text-[9px] text-slate-500 font-normal">Para Yatırma</span>
          </button>

          <button
            type="button"
            onClick={() => setTransferType('bank_to_cash')}
            className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
              transferType === 'bank_to_cash'
                ? 'bg-amber-600/30 text-amber-200 border-amber-400 shadow-lg shadow-amber-950/40 scale-[1.02]'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <span>Banka ➔ Kasa</span>
            <span className="text-[9px] text-slate-500 font-normal">Para Çekme</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source and Destination Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            {/* FROM */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Çıkış Hesabı (Kaynak)
              </label>
              {transferType === 'cash_to_bank' ? (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Nakit Kasa ({formatCurrency(cashBalance)})</span>
                </div>
              ) : (
                <select
                  value={fromBankId}
                  onChange={(e) => setFromBankId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-400"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* TO */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Giriş Hesabı (Hedef)
              </label>
              {transferType === 'bank_to_cash' ? (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  <span>Nakit Kasa</span>
                </div>
              ) : (
                <select
                  value={toBankId}
                  onChange={(e) => setToBankId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-400"
                >
                  {bankAccounts
                    .filter((b) => transferType !== 'bank_to_bank' || b.id !== fromBankId)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountName}
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Transfer Tutarı (₺) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-lg font-extrabold px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                İşlem Tarihi
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Açıklama (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="Örn: POS blokesinden vadesize aktarım, ATM nakit yatırma..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-sky-950/60 border border-sky-400/40 transition-all transform active:scale-98"
          >
            Transferi Tamamla
          </button>
        </form>
      </div>
    </div>
  );
};
