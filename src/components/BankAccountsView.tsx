import React, { useState, useMemo } from 'react';
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  Copy,
  Check,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Building2,
  MoreVertical,
  Edit2,
  Trash2,
  Wallet,
  History,
  Sparkles,
  ShieldCheck,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
} from 'lucide-react';
import { BankAccount, BankAccountType, Transaction } from '../types';
import { calculateBankAccountBalance } from '../utils/storage';
import { formatCurrency, formatDateTurkish } from '../utils/formatters';

interface BankAccountsViewProps {
  bankAccounts: BankAccount[];
  transactions: Transaction[];
  onOpenNewAccountModal: () => void;
  onEditAccount: (account: BankAccount) => void;
  onDeleteAccount: (accountId: string) => void;
  onOpenTransferModal: () => void;
  onDepositToAccount: (account: BankAccount) => void;
  onWithdrawFromAccount: (account: BankAccount) => void;
}

export const BankAccountsView: React.FC<BankAccountsViewProps> = ({
  bankAccounts,
  transactions,
  onOpenNewAccountModal,
  onEditAccount,
  onDeleteAccount,
  onOpenTransferModal,
  onDepositToAccount,
  onWithdrawFromAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [copiedIbanId, setCopiedIbanId] = useState<string | null>(null);
  const [historyAccount, setHistoryAccount] = useState<BankAccount | null>(null);

  // Compute live balances for each account
  const accountsWithBalances = useMemo(() => {
    return bankAccounts.map((account) => {
      const liveBalance = calculateBankAccountBalance(account, transactions);
      return {
        ...account,
        liveBalance,
      };
    });
  }, [bankAccounts, transactions]);

  // Aggregate stats
  const totalBankBalance = useMemo(() => {
    return accountsWithBalances.reduce((acc, a) => acc + a.liveBalance, 0);
  }, [accountsWithBalances]);

  const checkingCount = bankAccounts.filter((a) => a.accountType === 'checking').length;
  const commercialCount = bankAccounts.filter((a) => a.accountType === 'commercial').length;
  const posCount = bankAccounts.filter((a) => a.accountType === 'pos').length;
  const savingsCount = bankAccounts.filter((a) => a.accountType === 'savings').length;

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accountsWithBalances.filter((acc) => {
      const matchesSearch =
        acc.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (acc.iban && acc.iban.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType =
        selectedType === 'all' || acc.accountType === selectedType;

      return matchesSearch && matchesType;
    });
  }, [accountsWithBalances, searchTerm, selectedType]);

  const handleCopyIban = (account: BankAccount) => {
    if (!account.iban) return;
    navigator.clipboard.writeText(account.iban.replace(/\s+/g, ''));
    setCopiedIbanId(account.id);
    setTimeout(() => {
      setCopiedIbanId(null);
    }, 2000);
  };

  // Transactions for the selected history account
  const accountTransactions = useMemo(() => {
    if (!historyAccount) return [];
    return transactions.filter(
      (tx) =>
        tx.bankAccountId === historyAccount.id ||
        tx.toBankAccountId === historyAccount.id ||
        (!tx.bankAccountId && tx.paymentSource === 'bank' && tx.bankName === historyAccount.bankName)
    );
  }, [historyAccount, transactions]);

  const getAccountTypeBadge = (type: BankAccountType) => {
    switch (type) {
      case 'checking':
        return { label: 'Vadesiz', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'commercial':
        return { label: 'Ticari / Şirket', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'pos':
        return { label: 'POS & Tahsilat', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'savings':
        return { label: 'Vadeli / Birikim', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      default:
        return { label: 'Banka', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  };

  const getBankGradient = (bankName: string) => {
    const lower = bankName.toLowerCase();
    if (lower.includes('garanti')) {
      return 'from-[#0b2918] via-[#0e171f] to-[#0a1219] border-emerald-700/50 text-emerald-400';
    }
    if (lower.includes('iş') || lower.includes('isbank')) {
      return 'from-[#0c1e3d] via-[#0e171f] to-[#0a1219] border-sky-700/50 text-sky-400';
    }
    if (lower.includes('akbank')) {
      return 'from-[#330f18] via-[#160f1c] to-[#0a1219] border-rose-700/50 text-rose-400';
    }
    if (lower.includes('yapı') || lower.includes('yapi')) {
      return 'from-[#141442] via-[#0f142b] to-[#0a1219] border-indigo-700/50 text-indigo-400';
    }
    if (lower.includes('ziraat')) {
      return 'from-[#380e14] via-[#1a0e1b] to-[#0a1219] border-red-700/50 text-red-400';
    }
    if (lower.includes('vakıf') || lower.includes('vakif')) {
      return 'from-[#2e210b] via-[#17141f] to-[#0a1219] border-amber-700/50 text-amber-400';
    }
    if (lower.includes('enpara') || lower.includes('qnb')) {
      return 'from-[#25103a] via-[#140e24] to-[#0a1219] border-purple-700/50 text-purple-400';
    }
    return 'from-[#10192e] via-[#0d1322] to-[#080d17] border-sky-800/40 text-sky-400';
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn pb-24">
      {/* Top Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1f38] via-[#0d1428] to-[#080a14] p-5 sm:p-6 border border-sky-800/40 shadow-2xl shadow-sky-950/60">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1.5 w-fit">
                <Landmark className="w-3.5 h-3.5" /> BANKA HESAPLARIM
              </span>
              <span className="text-xs text-slate-400 font-medium">
                ({bankAccounts.length} Kayıtlı Hesap)
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              {formatCurrency(totalBankBalance)}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Tüm vadesiz, ticari ve POS banka hesaplarınızın anlık toplam likit bakiyesi
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenTransferModal}
              className="py-2.5 px-3.5 rounded-2xl bg-sky-900/40 hover:bg-sky-800/50 text-sky-200 border border-sky-600/40 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-sky-950/40 transition-all active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4 text-sky-400" />
              <span>Hesaplar Arası Transfer</span>
            </button>

            <button
              onClick={onOpenNewAccountModal}
              className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-sky-950/60 border border-sky-400/40 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Yeni Banka Hesabı Ekle</span>
            </button>
          </div>
        </div>

        {/* Account Types Breakdown Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-5 mt-5 border-t border-sky-900/40">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Vadesiz Mevduat</span>
            <span className="text-sm font-bold text-emerald-400">{checkingCount} Hesap</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Ticari / Şirket</span>
            <span className="text-sm font-bold text-sky-400">{commercialCount} Hesap</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">POS & Tahsilat</span>
            <span className="text-sm font-bold text-rose-400">{posCount} Hesap</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-semibold">Vadeli / Birikim</span>
            <span className="text-sm font-bold text-amber-400">{savingsCount} Hesap</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Banka, hesap veya IBAN ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111122] border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'checking', label: 'Vadesiz' },
            { id: 'commercial', label: 'Ticari' },
            { id: 'pos', label: 'POS' },
            { id: 'savings', label: 'Vadeli' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedType === type.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-950/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bank Accounts Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-[#111122] border border-slate-800">
          <Landmark className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Kayıtlı Banka Hesabı Bulunamadı</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {searchTerm
              ? 'Arama kriterlerinize uyan banka hesabı bulunamadı.'
              : 'Henüz bir banka hesabı tanımlamadınız. İlk banka hesabınızı ekleyerek bakiye takibine başlayın.'}
          </p>
          <button
            onClick={onOpenNewAccountModal}
            className="py-2.5 px-4 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-950/50"
          >
            + Yeni Banka Hesabı Tanımla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAccounts.map((account) => {
            const typeBadge = getAccountTypeBadge(account.accountType);
            const gradientStyle = getBankGradient(account.bankName);
            const isCopied = copiedIbanId === account.id;

            return (
              <div
                key={account.id}
                className={`relative rounded-3xl bg-gradient-to-br ${gradientStyle} p-5 border shadow-xl transition-all hover:scale-[1.01]`}
              >
                {/* Top Row: Bank Badge & Action Dropdown */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-white font-black text-xs">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{account.bankName}</h4>
                      <span className="text-[11px] text-slate-300 font-medium">
                        {account.accountName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {account.isPrimary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ⭐ Ana Hesap
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${typeBadge.color}`}
                    >
                      {typeBadge.label}
                    </span>
                  </div>
                </div>

                {/* Balance Display */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                    Güncel Hesap Bakiyesi
                  </span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span
                      className={`text-2xl font-black tracking-tight ${
                        account.liveBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(account.liveBalance)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Açılış: {formatCurrency(account.initialBalance)}
                    </span>
                  </div>
                </div>

                {/* IBAN & Account Details */}
                {account.iban && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        IBAN
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-200 truncate select-all">
                        {account.iban}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyIban(account)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all shrink-0 ${
                        isCopied
                          ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 font-bold'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      title="IBAN Kopyala"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Kopyala</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Branch / Account number info */}
                {(account.branchName || account.accountNumber) && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
                    {account.branchName && <span>Şube: {account.branchName}</span>}
                    {account.accountNumber && <span>Hesap No: {account.accountNumber}</span>}
                  </div>
                )}

                {/* Bottom Actions Row */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDepositToAccount(account)}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-700/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                      title="Para Girişi Ekle"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>Para Girişi</span>
                    </button>

                    <button
                      onClick={() => onWithdrawFromAccount(account)}
                      className="py-1.5 px-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-700/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                      title="Para Çıkışı / Ödeme Ekle"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>Para Çıkışı</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setHistoryAccount(account)}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
                      title="Hesap Hareketleri"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onEditAccount(account)}
                      className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `"${account.bankName} - ${account.accountName}" hesabını silmek istediğinize emin misiniz?`
                          )
                        ) {
                          onDeleteAccount(account.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors"
                      title="Hesabı Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Transaction History Drawer / Modal */}
      {historyAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#101022] border border-sky-800/40 p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
            <button
              onClick={() => setHistoryAccount(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Hesap Hareketleri</h3>
                <p className="text-xs text-slate-400">
                  {historyAccount.bankName} - {historyAccount.accountName}
                </p>
              </div>
            </div>

            {/* Account Quick Stats */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Güncel Bakiye</span>
                <span className="text-lg font-black text-emerald-400">
                  {formatCurrency(calculateBankAccountBalance(historyAccount, transactions))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-semibold">Açılış Bakiyesi</span>
                <span className="text-sm font-bold text-slate-300">
                  {formatCurrency(historyAccount.initialBalance)}
                </span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {accountTransactions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Bu hesaba ait henüz bir gelir, gider veya transfer hareketi kaydedilmemiş.
                </div>
              ) : (
                accountTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {tx.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{tx.description}</p>
                      <span className="text-[10px] text-slate-500">{formatDateTurkish(tx.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
