import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, Sparkles, Wifi } from 'lucide-react';
import { CreditCard } from '../../types';
import { BANK_PRESETS, detectBankTheme } from '../../data/bankPresets';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<CreditCard>) => void;
  editingCard?: CreditCard | null;
}

export const CardModal: React.FC<CardModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCard,
}) => {
  const [bankName, setBankName] = useState('Garanti BBVA');
  const [cardName, setCardName] = useState('Bonus Platinum');
  const [cardNumberLast4, setCardNumberLast4] = useState('4821');
  const [totalLimit, setTotalLimit] = useState('50000');
  const [currentDebt, setCurrentDebt] = useState('0');
  const [cutoffDay, setCutoffDay] = useState('15');
  const [dueDay, setDueDay] = useState('25');
  const [minPaymentRate, setMinPaymentRate] = useState('20');
  const [cardHolderName, setCardHolderName] = useState('AHMET YILMAZ');
  const [selectedThemeId, setSelectedThemeId] = useState<string>('garanti');

  useEffect(() => {
    if (editingCard) {
      setBankName(editingCard.bankName);
      setCardName(editingCard.cardName);
      setCardNumberLast4(editingCard.cardNumberLast4);
      setTotalLimit(editingCard.totalLimit.toString());
      setCurrentDebt(editingCard.currentDebt.toString());
      setCutoffDay(editingCard.cutoffDay.toString());
      setDueDay(editingCard.dueDay.toString());
      setMinPaymentRate(editingCard.minPaymentRate.toString());
      setCardHolderName(editingCard.cardHolderName || 'KULLANICI');
      setSelectedThemeId(editingCard.themeId || 'garanti');
    } else {
      setBankName('Garanti BBVA');
      setCardName('Bonus');
      setCardNumberLast4('1234');
      setTotalLimit('50000');
      setCurrentDebt('0');
      setCutoffDay('10');
      setDueDay('20');
      setMinPaymentRate('20');
      setCardHolderName('KART SAHİBİ');
      setSelectedThemeId('garanti');
    }
  }, [editingCard, isOpen]);

  // Real-time live bank theme detection
  const detectedTheme = detectBankTheme(`${bankName} ${cardName}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(totalLimit) || 0;
    const debtNum = parseFloat(currentDebt) || 0;

    onSave({
      id: editingCard?.id,
      bankName,
      cardName,
      cardNumberLast4: cardNumberLast4.slice(-4) || '0000',
      totalLimit: limitNum,
      currentDebt: debtNum,
      cutoffDay: parseInt(cutoffDay, 10) || 1,
      dueDay: parseInt(dueDay, 10) || 10,
      minPaymentRate: parseInt(minPaymentRate, 10) || 20,
      cardHolderName: cardHolderName.toUpperCase(),
      themeId: selectedThemeId || detectedTheme.id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#11111f] border border-purple-800/40 p-5 sm:p-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/40 flex items-center justify-center">
            <CardIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingCard ? 'Kredi Kartını Düzenle' : 'Yeni Kredi Kartı Ekle'}
            </h3>
            <p className="text-xs text-slate-400">Banka rengi otomatik algılanır</p>
          </div>
        </div>

        {/* Live 3D Bank Skin Preview */}
        <div
          className={`relative p-4 rounded-2xl text-white bg-gradient-to-tr ${detectedTheme.gradient} shadow-xl mb-4 min-h-[150px] flex flex-col justify-between overflow-hidden border border-white/20 transition-all duration-300`}
        >
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-black tracking-wider uppercase drop-shadow-md">
              {detectedTheme.logoText || bankName || 'BANKA ADI'}
            </span>
            <div className="flex items-center gap-1 opacity-90">
              <Wifi className="w-3.5 h-3.5 rotate-90" />
              <Sparkles className="w-3 h-3 text-yellow-300" />
            </div>
          </div>

          <div className="relative z-10 my-1 flex items-center justify-between">
            <div className="w-8 h-5 rounded bg-gradient-to-br from-amber-300 to-amber-600 border border-yellow-200" />
            <div className="font-mono text-xs sm:text-sm font-bold tracking-widest text-slate-100">
              •••• •••• •••• {cardNumberLast4 || '0000'}
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between text-[10px] pt-1 border-t border-white/20">
            <div>
              <span className="opacity-75 block text-[8px] uppercase">Kart Sahibi</span>
              <span className="font-bold uppercase tracking-wider">{cardHolderName || 'KULLANICI'}</span>
            </div>
            <div className="text-right">
              <span className="opacity-75 block text-[8px] uppercase">Son Gün / Kesim</span>
              <span className="font-mono font-bold text-yellow-200">Ayın {dueDay} / {cutoffDay}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Bank Presets Shortcuts */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1.5">
              Hızlı Banka Teması Seç (Otomatik Renk & Stil)
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {BANK_PRESETS.slice(0, 7).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBankName(b.keywords[0] ? b.keywords[0].toUpperCase() : b.name);
                    setSelectedThemeId(b.id);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-fuchsia-500/50 text-[11px] font-medium text-slate-300 whitespace-nowrap transition-all"
                >
                  {b.name.split('/')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Banka Adı <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Garanti, İş Bankası, Akbank..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kart Adı / Modeli</label>
              <input
                type="text"
                placeholder="Örn: Bonus Platinum, Maximum..."
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kart Limiti (₺) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                required
                step="1"
                placeholder="Örn: 75000"
                value={totalLimit}
                onChange={(e) => setTotalLimit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mevcut Borç (₺)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Örn: 15400"
                value={currentDebt}
                onChange={(e) => setCurrentDebt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-rose-400 focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Son 4 Hane</label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                value={cardNumberLast4}
                onChange={(e) => setCardNumberLast4(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Hesap Kesim (Gün)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={cutoffDay}
                onChange={(e) => setCutoffDay(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-center text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Son Ödeme (Gün)</label>
              <input
                type="number"
                min={1}
                max={31}
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-center text-yellow-300 font-bold focus:outline-none focus:border-fuchsia-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Kart Sahibi Adı</label>
              <input
                type="text"
                placeholder="AD SOYAD"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs uppercase text-white focus:outline-none focus:border-fuchsia-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Asgari Ödeme Oranı</label>
              <select
                value={minPaymentRate}
                onChange={(e) => setMinPaymentRate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-fuchsia-500"
              >
                <option value="20">%20 (Standart Kartlar)</option>
                <option value="40">%40 (Yüksek Limitli Kartlar)</option>
                <option value="10">%10 (Özel Ticari)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-fuchsia-950/50 transition-all active:scale-[0.98]"
          >
            {editingCard ? 'Kartı Güncelle' : 'Kredi Kartını Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
