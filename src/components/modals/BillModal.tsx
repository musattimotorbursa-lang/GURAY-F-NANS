import React, { useState, useEffect } from 'react';
import { X, Receipt } from 'lucide-react';
import { Bill, BillCategory } from '../../types';
import { getNextDueDayDate } from '../../utils/formatters';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Partial<Bill>) => void;
  editingBill?: Bill | null;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBill,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BillCategory>('electricity');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('15');
  const [dueDate, setDueDate] = useState(getNextDueDayDate(15));
  const [autoRenewMonthly, setAutoRenewMonthly] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingBill) {
      setTitle(editingBill.title);
      setCategory(editingBill.category);
      setAmount(editingBill.amount.toString());
      setDueDay(editingBill.dueDay.toString());
      setDueDate(editingBill.dueDate);
      setAutoRenewMonthly(editingBill.autoRenewMonthly);
      setNotes(editingBill.notes || '');
    } else {
      setTitle('');
      setCategory('electricity');
      setAmount('');
      setDueDay('15');
      setDueDate(getNextDueDayDate(15));
      setAutoRenewMonthly(true);
      setNotes('');
    }
  }, [editingBill, isOpen]);

  const handleDueDayChange = (val: string) => {
    setDueDay(val);
    const day = parseInt(val, 10) || 15;
    setDueDate(getNextDueDayDate(day));
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount.replace(',', '.')) || 0;
    if (amountNum <= 0 || !title.trim()) return;

    onSave({
      id: editingBill?.id,
      title: title.trim(),
      category,
      amount: amountNum,
      dueDay: parseInt(dueDay, 10) || 15,
      dueDate,
      isPaid: editingBill?.isPaid || false,
      autoRenewMonthly,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#11111f] border border-pink-800/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingBill ? 'Faturayı Düzenle' : 'Yeni Fatura / Gider Ekle'}
            </h3>
            <p className="text-xs text-slate-400">Son ödeme yaklaştığında alarm uyarır</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Fatura / Gider Başlığı <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Örn: Elektrik Faturası (Limak), Kira, Netflix..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BillCategory)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
              >
                <option value="phone">📱 Telefon & GSM</option>
                <option value="internet">🌐 İnternet & Fiber</option>
                <option value="dues">🏢 Apartman & Site Aidatı</option>
                <option value="electricity">⚡ Elektrik</option>
                <option value="water">💧 Su</option>
                <option value="gas">🔥 Doğalgaz</option>
                <option value="rent">🏠 Kira & Konut</option>
                <option value="market">🛒 Market & Gıda</option>
                <option value="fuel">⛽ Akaryakıt & Yakıt</option>
                <option value="subscription">📺 Abonelik & Dijital</option>
                <option value="other">📑 Diğer Gider</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tutar (₺) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-extrabold text-pink-400 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Her Ayın Günü (1-31)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => handleDueDayChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-center font-bold text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Vade Tarihi</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-yellow-300 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Not / Açıklama</label>
            <input
              type="text"
              placeholder="Örn: Abone no: 104829"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={autoRenewMonthly}
              onChange={(e) => setAutoRenewMonthly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-pink-600 focus:ring-0"
            />
            <span>Her ay otomatik yenilensin (Ödenince sonraki aya devreder)</span>
          </label>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-pink-950/50 transition-all active:scale-[0.98]"
          >
            {editingBill ? 'Faturayı Güncelle' : 'Faturayı Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
