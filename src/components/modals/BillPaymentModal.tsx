import React, { useState } from 'react';
import { X, Receipt, Banknote, Landmark, CreditCard as CardIcon, CheckCircle2 } from 'lucide-react';
import { Bill, CreditCard, PaymentSource, BankAccount } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface BillPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  cards: CreditCard[];
  cashBalance: number;
  bankBalance: number;
  bankAccounts?: BankAccount[];
  onConfirmPayment: (
    bill: Bill,
    source: PaymentSource,
    cardId?: string,
    bankName?: string,
    bankAccountId?: string
  ) => void;
}

export const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  isOpen,
  onClose,
  bill,
  cards,
  cashBalance,
  bankBalance,
  bankAccounts = [],
  onConfirmPayment,
}) => {
  const [source, setSource] = useState<PaymentSource>('bank');
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>(
    bankAccounts[0]?.id || ''
  );
  const [bankName, setBankName] = useState<string>(
    bankAccounts[0]?.bankName || 'Garanti BBVA'
  );

  if (!isOpen || !bill) return null;

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const cardAvailLimit = selectedCard
    ? Math.max(0, selectedCard.totalLimit - selectedCard.currentDebt)
    : 0;

  const selectedBankAcc = bankAccounts.find((b) => b.id === selectedBankAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenBankName =
      source === 'bank'
        ? selectedBankAcc
          ? `${selectedBankAcc.bankName} (${selectedBankAcc.accountName})`
          : bankName
        : undefined;

    onConfirmPayment(
      bill,
      source,
      source === 'card' ? selectedCard?.id : undefined,
      chosenBankName,
      source === 'bank' ? selectedBankAccountId || undefined : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#111122] border border-pink-700/50 p-6 shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-500 p-[1.5px]">
            <div className="w-full h-full bg-[#111122] rounded-[14px] flex items-center justify-center text-pink-400">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Fatura Ödemesi Yap</h3>
            <p className="text-xs text-slate-400">Ödeme kaynağını ve bankayı/kartı seçin</p>
          </div>
        </div>

        {/* Bill Info Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/20 to-slate-900/60 border border-pink-800/40 mb-5">
          <span className="text-[10px] uppercase font-extrabold text-pink-300 tracking-wider">
            Ödenecek Fatura
          </span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-base font-extrabold text-white truncate">{bill.title}</h4>
            <span className="text-xl font-black text-pink-400 shrink-0 ml-2">
              {formatCurrency(bill.amount)}
            </span>
          </div>
          {bill.notes && (
            <p className="text-xs text-slate-400 mt-1 truncate">{bill.notes}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Source Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Hangi Hesaptan / Kaynaktan Ödenecek?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSource('bank')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  source === 'bank'
                    ? 'bg-sky-600/30 text-sky-200 border-sky-400 shadow-lg shadow-sky-950/40 scale-[1.02]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Landmark className="w-5 h-5 text-sky-400" />
                <span>Banka Hesabı</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Bakiye: {formatCurrency(bankBalance)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('card')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  source === 'card'
                    ? 'bg-fuchsia-600/30 text-fuchsia-200 border-fuchsia-400 shadow-lg shadow-fuchsia-950/40 scale-[1.02]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <CardIcon className="w-5 h-5 text-fuchsia-400" />
                <span>Kredi Kartı</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Limit Düşer
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSource('cash')}
                className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  source === 'cash'
                    ? 'bg-emerald-600/30 text-emerald-200 border-emerald-400 shadow-lg shadow-emerald-950/40 scale-[1.02]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800/80'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span>Nakit Kasa</span>
                <span className="text-[9px] text-slate-400 font-normal">
                  Kasa: {formatCurrency(cashBalance)}
                </span>
              </button>
            </div>
          </div>

          {/* Conditional Detail: If Credit Card */}
          {source === 'card' && (
            <div className="p-3.5 bg-fuchsia-950/25 border border-fuchsia-800/40 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-fuchsia-300">
                Kullanılacak Kredi Kartını Seçin:
              </label>
              {cards.length === 0 ? (
                <p className="text-xs text-rose-400 font-semibold">
                  Kayıtlı kredi kartınız yok. Lütfen önce Kartlar menüsünden kart ekleyin.
                </p>
              ) : (
                <>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-fuchsia-400 font-semibold"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.bankName} - {c.cardName} (Limit: {formatCurrency(c.totalLimit)} / Borç:{' '}
                        {formatCurrency(c.currentDebt)})
                      </option>
                    ))}
                  </select>
                  {selectedCard && (
                    <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                      <span>Kullanılabilir Kart Limiti:</span>
                      <span className="font-extrabold text-fuchsia-300">
                        {formatCurrency(cardAvailLimit)}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Conditional Detail: If Bank Account */}
          {source === 'bank' && (
            <div className="p-3.5 bg-sky-950/25 border border-sky-800/40 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-sky-300">
                Ödemenin Çıkacağı Banka Hesabı:
              </label>
              {bankAccounts.length > 0 ? (
                <div>
                  <select
                    value={selectedBankAccountId}
                    onChange={(e) => {
                      setSelectedBankAccountId(e.target.value);
                      const b = bankAccounts.find((acc) => acc.id === e.target.value);
                      if (b) setBankName(b.bankName);
                    }}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 font-semibold"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountName} {b.iban ? `(${b.iban.substring(0, 10)}...)` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedBankAcc && (
                    <div className="flex items-center justify-between text-[11px] text-sky-300 pt-1">
                      <span>Seçili Hesap:</span>
                      <span className="font-semibold text-slate-200">
                        {selectedBankAcc.bankName} - {selectedBankAcc.accountName}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Örn: Garanti BBVA Vadesiz, İş Bankası, Yapı Kredi..."
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
                />
              )}
              <p className="text-[10px] text-slate-400">
                Fatura tutarı ({formatCurrency(bill.amount)}) banka bakiyenizden otomatik düşülecek
                ve kasa defterine banka gideri olarak yazılacaktır.
              </p>
            </div>
          )}

          {/* Conditional Detail: If Cash */}
          {source === 'cash' && (
            <div className="p-3.5 bg-emerald-950/25 border border-emerald-800/40 rounded-2xl">
              <p className="text-xs text-emerald-300 font-medium">
                Ödeme fiziki nakit kasadan ({formatCurrency(cashBalance)}) düşülecek ve kasa
                defterine nakit gider olarak kaydedilecektir.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={source === 'card' && cards.length === 0}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-emerald-600 hover:from-pink-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-pink-950/50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Ödemeyi Onayla & Kasadan Düş</span>
          </button>
        </form>
      </div>
    </div>
  );
};
