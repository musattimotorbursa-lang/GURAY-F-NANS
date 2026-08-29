import React, { useState, useEffect } from 'react';
import {
  X,
  Landmark,
  CheckCircle2,
  Sparkles,
  Building2,
  CreditCard,
  Wallet,
  Coins,
} from 'lucide-react';
import { BankAccount, BankAccountType } from '../../types';

interface BankAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAccount: (account: Partial<BankAccount>) => void;
  editingAccount?: BankAccount | null;
}

interface BankPreset {
  name: string;
  color: string;
  theme: string;
  logoText: string;
  bgGradient: string;
}

const BANK_PRESETS: BankPreset[] = [
  {
    name: 'Garanti BBVA',
    color: 'emerald',
    theme: '#10b981',
    logoText: 'GARANTİ',
    bgGradient: 'from-emerald-950/80 via-slate-900 to-emerald-900/40',
  },
  {
    name: 'Türkiye İş Bankası',
    color: 'sky',
    theme: '#0ea5e9',
    logoText: 'İŞ BANKASI',
    bgGradient: 'from-sky-950/80 via-slate-900 to-blue-900/40',
  },
  {
    name: 'Akbank',
    color: 'rose',
    theme: '#f43f5e',
    logoText: 'AKBANK',
    bgGradient: 'from-rose-950/80 via-slate-900 to-red-900/40',
  },
  {
    name: 'Yapı Kredi',
    color: 'indigo',
    theme: '#6366f1',
    logoText: 'YAPI KREDİ',
    bgGradient: 'from-indigo-950/80 via-slate-900 to-blue-950/50',
  },
  {
    name: 'Ziraat Bankası',
    color: 'red',
    theme: '#ef4444',
    logoText: 'ZİRAAT',
    bgGradient: 'from-red-950/80 via-slate-900 to-amber-950/40',
  },
  {
    name: 'Vakıfbank',
    color: 'amber',
    theme: '#f59e0b',
    logoText: 'VAKIFBANK',
    bgGradient: 'from-amber-950/80 via-slate-900 to-yellow-950/40',
  },
  {
    name: 'Halkbank',
    color: 'blue',
    theme: '#3b82f6',
    logoText: 'HALKBANK',
    bgGradient: 'from-blue-950/80 via-slate-900 to-sky-950/40',
  },
  {
    name: 'QNB Finansbank',
    color: 'purple',
    theme: '#a855f7',
    logoText: 'QNB',
    bgGradient: 'from-purple-950/80 via-slate-900 to-fuchsia-950/40',
  },
  {
    name: 'Enpara.com',
    color: 'violet',
    theme: '#8b5cf6',
    logoText: 'ENPARA',
    bgGradient: 'from-purple-950/90 via-slate-900 to-indigo-950/50',
  },
  {
    name: 'Denizbank',
    color: 'cyan',
    theme: '#06b6d4',
    logoText: 'DENİZBANK',
    bgGradient: 'from-cyan-950/80 via-slate-900 to-blue-950/40',
  },
  {
    name: 'Kuveyt Türk',
    color: 'teal',
    theme: '#14b8a6',
    logoText: 'KUVEYT TÜRK',
    bgGradient: 'from-teal-950/80 via-slate-900 to-emerald-950/40',
  },
  {
    name: 'TEB (Türk Ekonomi Bankası)',
    color: 'emerald',
    theme: '#10b981',
    logoText: 'TEB',
    bgGradient: 'from-emerald-950/80 via-slate-900 to-teal-950/40',
  },
  {
    name: 'Fibabanka',
    color: 'blue',
    theme: '#2563eb',
    logoText: 'FİBABANKA',
    bgGradient: 'from-blue-950/80 via-slate-900 to-slate-950',
  },
  {
    name: 'Diğer Banka',
    color: 'slate',
    theme: '#64748b',
    logoText: 'BANKA',
    bgGradient: 'from-slate-900 via-slate-950 to-slate-900',
  },
];

export const BankAccountModal: React.FC<BankAccountModalProps> = ({
  isOpen,
  onClose,
  onSaveAccount,
  editingAccount,
}) => {
  const [bankName, setBankName] = useState<string>('Garanti BBVA');
  const [accountName, setAccountName] = useState<string>('Ana Vadesiz TL Hesabı');
  const [accountType, setAccountType] = useState<BankAccountType>('checking');
  const [iban, setIban] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');
  const [initialBalance, setInitialBalance] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('TRY');
  const [themeColor, setThemeColor] = useState<string>('emerald');
  const [isPrimary, setIsPrimary] = useState<boolean>(false);

  useEffect(() => {
    if (editingAccount) {
      setBankName(editingAccount.bankName);
      setAccountName(editingAccount.accountName);
      setAccountType(editingAccount.accountType);
      setIban(editingAccount.iban || '');
      setAccountNumber(editingAccount.accountNumber || '');
      setBranchName(editingAccount.branchName || '');
      setInitialBalance(editingAccount.initialBalance.toString());
      setCurrency(editingAccount.currency || 'TRY');
      setThemeColor(editingAccount.themeColor || 'emerald');
      setIsPrimary(!!editingAccount.isPrimary);
    } else {
      setBankName('Garanti BBVA');
      setAccountName('Ana Vadesiz TL Hesabı');
      setAccountType('checking');
      setIban('');
      setAccountNumber('');
      setBranchName('');
      setInitialBalance('0');
      setCurrency('TRY');
      setThemeColor('emerald');
      setIsPrimary(false);
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleBankSelect = (preset: BankPreset) => {
    setBankName(preset.name);
    setThemeColor(preset.color);
    if (!editingAccount && accountName === 'Ana Vadesiz TL Hesabı') {
      setAccountName(`${preset.name} Vadesiz`);
    }
  };

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!val.startsWith('TR') && val.length > 0) {
      if (/^\d/.test(val)) {
        val = 'TR' + val;
      }
    }
    // Limit to max 26 chars for TR IBAN
    val = val.substring(0, 26);

    // Format with spaces: TRxx xxxx xxxx xxxx xxxx xxxx xx
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && (i === 2 || i === 6 || i === 10 || i === 14 || i === 18 || i === 22)) {
        formatted += ' ';
      }
      formatted += val[i];
    }
    setIban(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(initialBalance.replace(',', '.')) || 0;

    onSaveAccount({
      id: editingAccount?.id,
      bankName: bankName.trim(),
      accountName: accountName.trim() || `${bankName} Hesabı`,
      accountType,
      iban: iban.trim() || undefined,
      accountNumber: accountNumber.trim() || undefined,
      branchName: branchName.trim() || undefined,
      initialBalance: balanceNum,
      currency,
      themeColor,
      isPrimary,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#101020] border border-sky-800/40 p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingAccount ? 'Banka Hesabını Düzenle' : 'Yeni Banka Hesabı Ekle'}
            </h3>
            <p className="text-xs text-slate-400">
              Vadesiz, ticari, POS veya vadeli banka hesaplarınızı kaydedin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bank Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              Banka Seçimi
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-950/60 rounded-2xl border border-slate-800/80">
              {BANK_PRESETS.map((preset) => {
                const isSelected = bankName === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleBankSelect(preset)}
                    className={`py-2 px-2.5 rounded-xl text-left text-xs font-semibold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-sky-600/30 text-sky-200 border-sky-400 shadow-md font-bold'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                    <span className="truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Bank Name if not in presets */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Banka Adı (Manuel Giriş)
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Garanti BBVA, Akbank..."
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
            />
          </div>

          {/* Account Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hesap Adı / Tanımı <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Ana Vadesiz TL, Şirket Hesabı..."
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hesap Türü
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as BankAccountType)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-semibold"
              >
                <option value="checking">💼 Vadesiz Mevduat Hesabı</option>
                <option value="commercial">🏢 Ticari / Şirket Hesabı</option>
                <option value="pos">💳 POS & Tahsilat Hesabı</option>
                <option value="savings">📈 Vadeli / Birikim Hesabı</option>
              </select>
            </div>
          </div>

          {/* IBAN Input with format */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-300">
                IBAN Numarası (Opsiyonel)
              </label>
              <span className="text-[10px] text-slate-400">TRxx xxxx... formatında</span>
            </div>
            <input
              type="text"
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              value={iban}
              onChange={handleIbanChange}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white tracking-wider font-mono focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Branch & Account Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Şube Adı / Kodu (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: Bursa Heykel Şubesi"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Hesap Numarası / Müşteri No
              </label>
              <input
                type="text"
                placeholder="Örn: 1234567-501"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Initial Opening Balance & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-sky-950/20 border border-sky-800/30 rounded-2xl">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-sky-300 mb-1">
                Açılış / Devir Bakiyesi (₺)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-extrabold text-white focus:outline-none focus:border-sky-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Hesabın şu anki başlangıç bakiyesini girin. Banka harcamaları bu tutara eklenip düşecektir.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-300 mb-1">Para Birimi</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-sky-400"
              >
                <option value="TRY">₺ TRY (Türk Lirası)</option>
                <option value="USD">$ USD (Amerikan Doları)</option>
                <option value="EUR">€ EUR (Euro)</option>
                <option value="GBP">£ GBP (İngiliz Sterlini)</option>
              </select>
            </div>
          </div>

          {/* Primary Account Checkbox */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isPrimaryCheckbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500"
            />
            <label htmlFor="isPrimaryCheckbox" className="text-xs text-slate-300 cursor-pointer select-none">
              Bu hesabı <strong className="text-sky-300">Varsayılan Ana Banka Hesabı</strong> olarak işaretle
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-sky-950/60 border border-sky-400/40 transition-all transform active:scale-98"
          >
            {editingAccount ? 'Banka Hesabını Güncelle' : 'Banka Hesabını Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
