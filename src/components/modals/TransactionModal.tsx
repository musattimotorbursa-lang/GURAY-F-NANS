import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Landmark,
  CreditCard as CardIcon,
  Settings2,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentSource,
  CreditCard,
  CustomCategory,
  BankAccount,
} from '../../types';
import { getTodayString, formatCurrency } from '../../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Partial<Transaction>, cardIdToUpdate?: string) => void;
  initialType?: TransactionType;
  editingTransaction?: Transaction | null;
  cards: CreditCard[];
  categories: CustomCategory[];
  bankAccounts?: BankAccount[];
  onOpenCategoryManager?: () => void;
  initialDate?: string;
  initialBankAccountId?: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialType = 'expense',
  editingTransaction,
  cards,
  categories,
  bankAccounts = [],
  onOpenCategoryManager,
  initialDate,
  initialBankAccountId,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(initialDate || getTodayString());
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('cash');
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [bankName, setBankName] = useState<string>('Garanti BBVA');

  const availableCategories = categories.filter(
    (c) => c.type === type || c.type === 'both'
  );

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
      setPaymentSource(editingTransaction.paymentSource);
      setSelectedCardId(editingTransaction.cardId || cards[0]?.id || '');
      setSelectedBankAccountId(editingTransaction.bankAccountId || bankAccounts[0]?.id || '');
      setBankName(editingTransaction.bankName || bankAccounts[0]?.bankName || 'Garanti BBVA');
    } else {
      setType(initialType);
      setAmount('');
      const defaultCat =
        availableCategories.length > 0
          ? availableCategories[0].name
          : initialType === 'income'
          ? 'Maaş / Ana Gelir'
          : 'Market & Gıda';
      setCategory(defaultCat);
      setDescription('');
      setDate(initialDate || getTodayString());
      if (initialBankAccountId) {
        setPaymentSource('bank');
        setSelectedBankAccountId(initialBankAccountId);
        const bAcc = bankAccounts.find((b) => b.id === initialBankAccountId);
        if (bAcc) setBankName(bAcc.bankName);
      } else {
        setPaymentSource('cash');
        setSelectedBankAccountId(bankAccounts[0]?.id || '');
        setBankName(bankAccounts[0]?.bankName || 'Garanti BBVA');
      }
      setSelectedCardId(cards[0]?.id || '');
    }
  }, [editingTransaction, initialType, isOpen, initialDate, initialBankAccountId]);

  if (!isOpen) return null;

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const cardAvailLimit = selectedCard
    ? Math.max(0, selectedCard.totalLimit - selectedCard.currentDebt)
    : 0;

  const selectedBankAcc = bankAccounts.find((b) => b.id === selectedBankAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) return;

    const chosenBankName =
      paymentSource === 'bank'
        ? selectedBankAcc
          ? `${selectedBankAcc.bankName} (${selectedBankAcc.accountName})`
          : bankName
        : undefined;

    onSave(
      {
        id: editingTransaction?.id,
        type,
        amount: numAmount,
        category: category || (type === 'income' ? 'Gelir' : 'Gider'),
        description: description.trim() || category,
        date: date || getTodayString(),
        paymentSource,
        cardId: paymentSource === 'card' ? selectedCardId : undefined,
        bankAccountId: paymentSource === 'bank' ? selectedBankAccountId || undefined : undefined,
        bankName: chosenBankName,
      },
      paymentSource === 'card' ? selectedCardId : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#11111f] border border-purple-800/40 p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingTransaction ? 'İşlemi Düzenle' : type === 'income' ? 'Yeni Gelir Ekle' : 'Yeni Gider Ekle'}
            </h3>
            <p className="text-xs text-slate-400">Kasa defterine anında devirli işlenir</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('income');
                const incCats = categories.filter((c) => c.type === 'income' || c.type === 'both');
                if (incCats.length > 0) setCategory(incCats[0].name);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> Gelir (+)
            </button>

            <button
              type="button"
              onClick={() => {
                setType('expense');
                const expCats = categories.filter((c) => c.type === 'expense' || c.type === 'both');
                if (expCats.length > 0) setCategory(expCats[0].name);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" /> Gider (-)
            </button>
          </div>

          {/* Amount Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tutar (₺) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xl font-extrabold px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                TRY
              </span>
            </div>
          </div>

          {/* Payment Source */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Ödeme Kaynağı / Hesap</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentSource('cash')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentSource === 'cash'
                    ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-bold shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Nakit Kasa</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentSource('bank')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentSource === 'bank'
                    ? 'bg-sky-600/20 text-sky-300 border-sky-500/50 font-bold shadow-md shadow-sky-950/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Landmark className="w-4 h-4 text-sky-400" />
                <span>Banka Hesabı</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentSource('card')}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  paymentSource === 'card'
                    ? 'bg-fuchsia-600/20 text-fuchsia-300 border-fuchsia-500/50 font-bold shadow-md shadow-fuchsia-950/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <CardIcon className="w-4 h-4 text-fuchsia-400" />
                <span>Kredi Kartı</span>
              </button>
            </div>
          </div>

          {/* Select Credit Card if source is card */}
          {paymentSource === 'card' && (
            <div className="p-3 bg-fuchsia-950/25 border border-fuchsia-800/40 rounded-2xl space-y-1.5 animate-fadeIn">
              <label className="block text-xs font-bold text-fuchsia-300">
                Kullanılan Kredi Kartı (Otomatik Limit Düşecektir)
              </label>
              {cards.length === 0 ? (
                <p className="text-xs text-rose-400 font-semibold">Önce bir kredi kartı eklemelisiniz.</p>
              ) : (
                <>
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-fuchsia-500 font-semibold"
                  >
                    {cards.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.bankName} - {c.cardName} (Limit: {formatCurrency(c.totalLimit)} / Kalan Limit:{' '}
                        {formatCurrency(Math.max(0, c.totalLimit - c.currentDebt))})
                      </option>
                    ))}
                  </select>
                  {selectedCard && (
                    <div className="flex items-center justify-between text-[11px] text-fuchsia-300 pt-0.5">
                      <span>Kart Kullanılabilir Limit:</span>
                      <span className="font-extrabold">{formatCurrency(cardAvailLimit)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Bank details if source is bank */}
          {paymentSource === 'bank' && (
            <div className="p-3 bg-sky-950/25 border border-sky-800/40 rounded-2xl space-y-2 animate-fadeIn">
              <label className="block text-xs font-bold text-sky-300">
                İşlem Yapılacak Banka Hesabı
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
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-500"
                  >
                    {bankAccounts.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bankName} - {b.accountName} {b.iban ? `(${b.iban.substring(0, 10)}...)` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedBankAcc && (
                    <div className="flex items-center justify-between text-[11px] text-sky-300 pt-1 px-1">
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
                  placeholder="Örn: Garanti BBVA Vadesiz, İş Bankası..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                />
              )}
            </div>
          )}

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Kategori</label>
                {onOpenCategoryManager && (
                  <button
                    type="button"
                    onClick={onOpenCategoryManager}
                    className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-0.5 font-bold"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Yönet</span>
                  </button>
                )}
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {availableCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">İşlem Tarihi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Açıklama / Not</label>
            <input
              type="text"
              placeholder="Örn: Market alışverişi, Araç muayenesi, Yakıt alımı..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-xl transition-all active:scale-[0.98] ${
              type === 'income'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/50'
                : 'bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-950/50'
            }`}
          >
            {editingTransaction
              ? 'Değişiklikleri Kaydet'
              : type === 'income'
              ? 'Geliri Kasaya İşle (+)'
              : 'Gideri Kasadan / Limitten Düş (-)'}
          </button>
        </form>
      </div>
    </div>
  );
};

