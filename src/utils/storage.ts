import {
  Transaction,
  CreditCard,
  Loan,
  Bill,
  CashbookStats,
  CustomCategory,
  BankAccount,
} from '../types';
import { getTodayString, getNextDueDayDate } from './formatters';

const STORAGE_KEYS = {
  TRANSACTIONS: 'finans_transactions_v1',
  CREDIT_CARDS: 'finans_cards_v1',
  LOANS: 'finans_loans_v1',
  BILLS: 'finans_bills_v1',
  BANK_ACCOUNTS: 'finans_bank_accounts_v1',
  CATEGORIES: 'finans_categories_v2',
  LAST_AUTO_DEVIR_DATE: 'finans_last_auto_devir_date_v1',
  INITIAL_BALANCE: 'finans_initial_balance_v1',
  ALARM_SETTINGS: 'finans_alarm_settings_v1',
};

export const DEFAULT_CATEGORIES: CustomCategory[] = [
  // Gider Kategorileri
  { id: 'cat_phone', name: 'Telefon', type: 'expense', icon: 'Phone' },
  { id: 'cat_internet', name: 'İnternet', type: 'expense', icon: 'Wifi' },
  { id: 'cat_dues', name: 'Aidat', type: 'expense', icon: 'Building' },
  { id: 'cat_market', name: 'Market & Gıda', type: 'expense', icon: 'ShoppingBag' },
  { id: 'cat_fuel', name: 'Akaryakıt & Yakıt', type: 'expense', icon: 'Fuel' },
  { id: 'cat_electricity', name: 'Elektrik', type: 'expense', icon: 'Zap' },
  { id: 'cat_water', name: 'Su', type: 'expense', icon: 'Droplets' },
  { id: 'cat_gas', name: 'Doğalgaz', type: 'expense', icon: 'Flame' },
  { id: 'cat_rent', name: 'Kira & Konut', type: 'expense', icon: 'Home' },
  { id: 'cat_subscription', name: 'Abonelik & Dijital', type: 'expense', icon: 'Tv' },
  { id: 'cat_cardpay', name: 'Kredi Kartı Ödemesi', type: 'expense', icon: 'CreditCard' },
  { id: 'cat_loanpay', name: 'Kredi / Borç Ödemesi', type: 'expense', icon: 'Landmark' },
  { id: 'cat_dining', name: 'Restoran & Kafe', type: 'expense', icon: 'Utensils' },
  { id: 'cat_health', name: 'Sağlık & İlaç', type: 'expense', icon: 'HeartPulse' },
  { id: 'cat_shopping', name: 'Giyim & Alışveriş', type: 'expense', icon: 'Tag' },
  { id: 'cat_tax', name: 'Vergi & Muhasebe', type: 'expense', icon: 'FileText' },
  { id: 'cat_other_exp', name: 'Diğer Gider', type: 'expense', icon: 'MoreHorizontal' },

  // Gelir Kategorileri
  { id: 'cat_salary', name: 'Maaş / Ana Gelir', type: 'income', icon: 'Briefcase' },
  { id: 'cat_commercial', name: 'Ticari / Kasa Satış', type: 'income', icon: 'Store' },
  { id: 'cat_bonus', name: 'Ek Gelir / Prim', type: 'income', icon: 'TrendingUp' },
  { id: 'cat_receivable', name: 'Alacak Tahsilatı', type: 'income', icon: 'HandCoins' },
  { id: 'cat_investment', name: 'Yatırım & Faiz Geliri', type: 'income', icon: 'Coins' },
  { id: 'cat_other_inc', name: 'Diğer Gelir', type: 'income', icon: 'PlusCircle' },
];

// Initial Seed Data for first run
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_devir_1',
    type: 'income',
    amount: 18500,
    category: 'Kasa Devri',
    description: 'Önceki Dönemden Devreden Kasa Bakiyesi',
    date: getTodayString(),
    paymentSource: 'cash',
    isDevir: true,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'tx_seed_2',
    type: 'income',
    amount: 42000,
    category: 'Maaş / Ana Gelir',
    description: 'Aylık Hakediş Maaş Ödemesi',
    date: getTodayString(),
    paymentSource: 'bank',
    bankName: 'Garanti BBVA Vadesiz',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'tx_seed_3',
    type: 'expense',
    amount: 1450,
    category: 'Market & Gıda',
    description: 'Haftalık Mutfak Alışverişi',
    date: getTodayString(),
    paymentSource: 'card',
    cardId: 'card_garanti_1',
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'tx_seed_4',
    type: 'expense',
    amount: 850,
    category: 'Akaryakıt & Yakıt',
    description: 'Benzin Alımı (Shell)',
    date: getTodayString(),
    paymentSource: 'cash',
    createdAt: Date.now() - 3600000 * 2,
  },
];

const INITIAL_CARDS: CreditCard[] = [
  {
    id: 'card_garanti_1',
    bankName: 'Garanti BBVA',
    cardName: 'Bonus Platinum',
    cardNumberLast4: '4821',
    totalLimit: 75000,
    currentDebt: 18450,
    cutoffDay: 15,
    dueDay: 25,
    minPaymentRate: 20,
    themeId: 'garanti',
    cardHolderName: 'AHMET YILMAZ',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'card_isbank_2',
    bankName: 'Türkiye İş Bankası',
    cardName: 'Maximum Black',
    cardNumberLast4: '9034',
    totalLimit: 120000,
    currentDebt: 34200,
    cutoffDay: 5,
    dueDay: 15,
    minPaymentRate: 20,
    themeId: 'isbankasi',
    cardHolderName: 'AHMET YILMAZ',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'card_akbank_3',
    bankName: 'Akbank',
    cardName: 'Axess Wings',
    cardNumberLast4: '3156',
    totalLimit: 50000,
    currentDebt: 8900,
    cutoffDay: 20,
    dueDay: 30,
    minPaymentRate: 20,
    themeId: 'akbank',
    cardHolderName: 'AHMET YILMAZ',
    createdAt: Date.now() - 86400000 * 10,
  },
];

const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan_1',
    bankName: 'Garanti BBVA',
    loanTitle: 'İhtiyaç Kredisi (36 Ay)',
    principalAmount: 150000,
    totalRepayment: 234000,
    monthlyInstallment: 6500,
    totalInstallments: 36,
    paidInstallments: 12,
    remainingDebt: 156000, // 24 * 6500
    nextDueDate: getNextDueDayDate(18),
    startDate: '2025-08-18',
    isCompleted: false,
    notes: 'Düşük faizli ihtiyaç kredisi - Her ayın 18 inde ödenir',
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: 'loan_2',
    bankName: 'Türkiye İş Bankası',
    loanTitle: 'Taşıt Kredisi',
    principalAmount: 300000,
    totalRepayment: 456000,
    monthlyInstallment: 12666,
    totalInstallments: 36,
    paidInstallments: 20,
    remainingDebt: 202656,
    nextDueDate: getNextDueDayDate(8),
    startDate: '2024-12-08',
    isCompleted: false,
    notes: 'Araç finansmanı taksitleri',
    createdAt: Date.now() - 86400000 * 120,
  },
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'bill_1',
    title: 'Elektrik Faturası (Limak Uludağ)',
    category: 'electricity',
    amount: 1120,
    dueDay: 18,
    dueDate: getNextDueDayDate(18),
    isPaid: false,
    autoRenewMonthly: true,
    notes: 'Daire elektrik aboneliği',
    createdAt: Date.now(),
  },
  {
    id: 'bill_2',
    title: 'Doğalgaz Faturası (Bursagaz)',
    category: 'gas',
    amount: 1840,
    dueDay: 22,
    dueDate: getNextDueDayDate(22),
    isPaid: false,
    autoRenewMonthly: true,
    notes: 'Kış dönemi doğalgaz faturası',
    createdAt: Date.now(),
  },
  {
    id: 'bill_3',
    title: 'Fiber İnternet (TurkNet)',
    category: 'internet',
    amount: 499,
    dueDay: 12,
    dueDate: getNextDueDayDate(12),
    isPaid: false,
    autoRenewMonthly: true,
    notes: '1000 Mbps Fiber İnternet',
    createdAt: Date.now(),
  },
  {
    id: 'bill_4',
    title: 'Ev Kirası',
    category: 'rent',
    amount: 16500,
    dueDay: 1,
    dueDate: getNextDueDayDate(1),
    isPaid: true,
    lastPaidDate: getTodayString(),
    paidWithSource: 'bank',
    autoRenewMonthly: true,
    notes: 'Ev sahibi IBAN hesabına',
    createdAt: Date.now(),
  },
  {
    id: 'bill_5',
    title: 'Apartman Aidatı',
    category: 'dues',
    amount: 750,
    dueDay: 5,
    dueDate: getNextDueDayDate(5),
    isPaid: false,
    autoRenewMonthly: true,
    notes: 'Site/Bina aidat ödemesi',
    createdAt: Date.now(),
  },
  {
    id: 'bill_6',
    title: 'Turkcell Mobil Hat (Telefon)',
    category: 'phone',
    amount: 380,
    dueDay: 20,
    dueDate: getNextDueDayDate(20),
    isPaid: false,
    autoRenewMonthly: true,
    notes: 'Akıllı fatura tarifesi',
    createdAt: Date.now(),
  },
];

// Categories Management
export function getStoredCategories(): CustomCategory[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: CustomCategory[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    return INITIAL_TRANSACTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
}

// Otomatik Gece 00:00 Kasa Devri Kontrolü
export function checkAndPerformAutoMidnightDevir(currentTransactions?: Transaction[]): {
  updatedTransactions: Transaction[];
  hasDevirOccurred: boolean;
  devirAmount: number;
} {
  const txList = currentTransactions || getStoredTransactions();
  if (typeof window === 'undefined') {
    return { updatedTransactions: txList, hasDevirOccurred: false, devirAmount: 0 };
  }

  const todayStr = getTodayString();
  const lastAutoDevirDate = localStorage.getItem(STORAGE_KEYS.LAST_AUTO_DEVIR_DATE);

  // Zaten bugün için devir yapıldıysa tekrar yapma
  if (lastAutoDevirDate === todayStr) {
    return { updatedTransactions: txList, hasDevirOccurred: false, devirAmount: 0 };
  }

  // Bugün tarihli bir devir kaydı listede zaten var mı?
  const alreadyHasTodayDevir = txList.some(
    (t) => t.isDevir && t.date === todayStr
  );

  if (alreadyHasTodayDevir) {
    localStorage.setItem(STORAGE_KEYS.LAST_AUTO_DEVIR_DATE, todayStr);
    return { updatedTransactions: txList, hasDevirOccurred: false, devirAmount: 0 };
  }

  // Önceki günlerin net nakit kasasını hesapla
  let prevCashBalance = 0;
  txList.forEach((tx) => {
    if (tx.date < todayStr) {
      if (tx.paymentSource === 'cash') {
        if (tx.type === 'income') prevCashBalance += tx.amount;
        else if (tx.type === 'expense') prevCashBalance -= tx.amount;
      }
    }
  });

  // Eğer ilk kullanım değilse ve önceki günden kalan bir bakiye varsa devir oluştur
  const autoDevirTx: Transaction = {
    id: `tx_autodevir_${Date.now()}`,
    type: 'income',
    amount: Math.max(0, prevCashBalance),
    category: 'Kasa Devri',
    description: `Gece 00:00 Otomatik Kasa Devri (${todayStr})`,
    date: todayStr,
    paymentSource: 'cash',
    isDevir: true,
    createdAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEYS.LAST_AUTO_DEVIR_DATE, todayStr);
  const newTransactionsList = [autoDevirTx, ...txList];
  saveStoredTransactions(newTransactionsList);

  return {
    updatedTransactions: newTransactionsList,
    hasDevirOccurred: true,
    devirAmount: autoDevirTx.amount,
  };
}

export function getStoredCards(): CreditCard[] {
  if (typeof window === 'undefined') return INITIAL_CARDS;
  const stored = localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(INITIAL_CARDS));
    return INITIAL_CARDS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_CARDS;
  }
}

export function saveStoredCards(cards: CreditCard[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
}

export function getStoredLoans(): Loan[] {
  if (typeof window === 'undefined') return INITIAL_LOANS;
  const stored = localStorage.getItem(STORAGE_KEYS.LOANS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(INITIAL_LOANS));
    return INITIAL_LOANS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_LOANS;
  }
}

export function saveStoredLoans(loans: Loan[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
}

export function getStoredBills(): Bill[] {
  if (typeof window === 'undefined') return INITIAL_BILLS;
  const stored = localStorage.getItem(STORAGE_KEYS.BILLS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(INITIAL_BILLS));
    return INITIAL_BILLS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_BILLS;
  }
}

export function saveStoredBills(bills: Bill[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
}

const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'bank_acc_1',
    bankName: 'Garanti BBVA',
    accountName: 'Ana Vadesiz TL Hesabı',
    accountType: 'checking',
    iban: 'TR12 0006 2000 0001 2345 6789 01',
    accountNumber: '1234567-501',
    branchName: 'Bursa Heykel Şubesi',
    initialBalance: 25000,
    currency: 'TRY',
    themeColor: 'emerald',
    isPrimary: true,
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'bank_acc_2',
    bankName: 'Türkiye İş Bankası',
    accountName: 'Ticari Şirket Hesabı',
    accountType: 'commercial',
    iban: 'TR64 0006 4000 0012 3456 7890 12',
    accountNumber: '9876543-102',
    branchName: 'Nilüfer Ticari Şube',
    initialBalance: 48500,
    currency: 'TRY',
    themeColor: 'sky',
    isPrimary: false,
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: 'bank_acc_3',
    bankName: 'Akbank',
    accountName: 'POS / Tahsilat Hesabı',
    accountType: 'pos',
    iban: 'TR33 0004 6000 0034 5678 9012 34',
    accountNumber: '5544332-901',
    branchName: 'Çekirge Şubesi',
    initialBalance: 12000,
    currency: 'TRY',
    themeColor: 'rose',
    isPrimary: false,
    createdAt: Date.now() - 86400000 * 10,
  },
];

export function getStoredBankAccounts(): BankAccount[] {
  if (typeof window === 'undefined') return INITIAL_BANK_ACCOUNTS;
  const stored = localStorage.getItem(STORAGE_KEYS.BANK_ACCOUNTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(INITIAL_BANK_ACCOUNTS));
    return INITIAL_BANK_ACCOUNTS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return INITIAL_BANK_ACCOUNTS;
  } catch {
    return INITIAL_BANK_ACCOUNTS;
  }
}

export function saveStoredBankAccounts(accounts: BankAccount[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.BANK_ACCOUNTS, JSON.stringify(accounts));
}

// Calculate individual bank account live balance
export function calculateBankAccountBalance(
  account: BankAccount,
  transactions: Transaction[]
): number {
  let balance = account.initialBalance || 0;

  transactions.forEach((tx) => {
    // Check if this transaction belongs to this specific bank account
    const isTargetAccount =
      tx.bankAccountId === account.id ||
      (!tx.bankAccountId && tx.paymentSource === 'bank' && tx.bankName === account.bankName);

    if (isTargetAccount) {
      if (tx.type === 'income') {
        balance += tx.amount;
      } else if (tx.type === 'expense') {
        balance -= tx.amount;
      }
    }

    // Inter-account transfers
    if (tx.paymentSource === 'bank' && tx.toBankAccountId === account.id) {
      balance += tx.amount;
    }
  });

  return balance;
}

export function calculateCashStats(
  transactions: Transaction[],
  cards: CreditCard[],
  loans: Loan[],
  bills: Bill[],
  bankAccounts?: BankAccount[]
): CashbookStats {
  let totalIncome = 0;
  let totalExpense = 0;
  let cashIncome = 0;
  let cashExpense = 0;
  let bankIncome = 0;
  let bankExpense = 0;
  let openingBalance = 0;

  transactions.forEach((tx) => {
    if (tx.isDevir) {
      openingBalance += tx.amount;
    }
    if (tx.type === 'income') {
      totalIncome += tx.amount;
      if (tx.paymentSource === 'cash') cashIncome += tx.amount;
      if (tx.paymentSource === 'bank') bankIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      if (tx.paymentSource === 'cash') cashExpense += tx.amount;
      if (tx.paymentSource === 'bank') bankExpense += tx.amount;
    }
  });

  const netCashBalance = cashIncome - cashExpense;

  // Calculate total bank balance accurately including initial bank balances if accounts provided
  let totalBankBalance = 0;
  if (bankAccounts && bankAccounts.length > 0) {
    totalBankBalance = bankAccounts.reduce((acc, bAcc) => {
      return acc + calculateBankAccountBalance(bAcc, transactions);
    }, 0);
  } else {
    totalBankBalance = bankIncome - bankExpense;
  }

  let totalCreditCardDebt = 0;
  let totalCreditCardLimit = 0;
  cards.forEach((c) => {
    totalCreditCardDebt += c.currentDebt || 0;
    totalCreditCardLimit += c.totalLimit || 0;
  });

  let totalLoanDebt = 0;
  loans.forEach((l) => {
    if (!l.isCompleted) {
      totalLoanDebt += l.remainingDebt || 0;
    }
  });

  let totalPendingBills = 0;
  bills.forEach((b) => {
    if (!b.isPaid) {
      totalPendingBills += b.amount || 0;
    }
  });

  const netWorth = netCashBalance + totalBankBalance - totalCreditCardDebt - totalLoanDebt;

  return {
    openingBalance,
    totalIncome,
    totalExpense,
    netCashBalance,
    totalBankBalance,
    totalCreditCardDebt,
    totalCreditCardLimit,
    totalLoanDebt,
    totalPendingBills,
    netWorth,
  };
}

export function exportAllDataAsJSON(): string {
  const data = {
    transactions: getStoredTransactions(),
    cards: getStoredCards(),
    loans: getStoredLoans(),
    bills: getStoredBills(),
    bankAccounts: getStoredBankAccounts(),
    categories: getStoredCategories(),
    exportDate: new Date().toISOString(),
    version: '2.1.0',
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      saveStoredTransactions(parsed.transactions);
    }
    if (parsed.cards && Array.isArray(parsed.cards)) {
      saveStoredCards(parsed.cards);
    }
    if (parsed.loans && Array.isArray(parsed.loans)) {
      saveStoredLoans(parsed.loans);
    }
    if (parsed.bills && Array.isArray(parsed.bills)) {
      saveStoredBills(parsed.bills);
    }
    if (parsed.bankAccounts && Array.isArray(parsed.bankAccounts)) {
      saveStoredBankAccounts(parsed.bankAccounts);
    }
    if (parsed.categories && Array.isArray(parsed.categories)) {
      saveStoredCategories(parsed.categories);
    }
    return true;
  } catch {
    return false;
  }
}
