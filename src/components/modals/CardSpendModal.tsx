import React, { useState } from 'react';
import { X, ShoppingBag, CreditCard as CardIcon } from 'lucide-react';
import { CreditCard } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CardSpendModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCard | null;
  onConfirmSpend: (cardId: string, amount: number, category: string, description: string) => void;
}

const SPEND_CATEGORIES = [
  'Market & Gıda',
  'Akaryakıt & Benzin',
  'Restoran & Yeme İçme',
  'Giyim & Ayakkabı',
  'Elektronik & Teknoloji',
  'Kozmetik & Sağlık',
  'Seyahat & Uçak',
  'Abonelik & Dijital',
  'Diğer Harcama',
];

export const CardSpendModal: React.FC<CardSpendModalProps> = ({
  isOpen,
  onClose,
  card,
  onConfirmSpend,
}) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(SPEND_CATEGORIES[0]);
  const [description, setDescription] = useState('');

  if (!isOpen || !card) return null;

  const availableLimit = Math.max(0, card.totalLimit - card.currentDebt);

  const handleSpend = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum <= 0) return;

    onConfirmSpend(card.id, amountNum, category, description || `${card.bankName} Kart Harcaması`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#11111f] border border-purple-800/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Kartla Harcama Yap</h3>
            <p className="text-xs text-slate-400">
              {card.bankName} - {card.cardName} (•••• {card.cardNumberLast4})
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 mb-4 flex justify-between items-center text-xs">
          <span className="text-slate-400">Kullanılabilir Limit:</span>
          <span className="text-emerald-400 font-extrabold text-sm">{formatCurrency(availableLimit)}</span>
        </div>

        <form onSubmit={handleSpend} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Harcama Tutarı (₺) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-xl font-extrabold px-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Harcama Kategorisi</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {SPEND_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Açıklama</label>
            <input
              type="text"
              placeholder="Örn: Hafta sonu market alışverişi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/50 transition-all active:scale-[0.98]"
          >
            Harcamayı İşle (Limiti Düşür)
          </button>
        </form>
      </div>
    </div>
  );
};
