export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentSource = 'cash' | 'bank' | 'card';

export type TabType =
  | 'cashbook'
  | 'cards'
  | 'bank_accounts'
  | 'loans'
  | 'bills'
  | 'reports';

export type BankAccountType = 'checking' | 'savings' | 'commercial' | 'pos';

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountType: BankAccountType;
  iban?: string;
  accountNumber?: string;
  branchName?: string;
  initialBalance: number;
  currency: string;
  color?: string;
  themeColor?: string;
  isDefault?: boolean;
  isPrimary?: boolean;
  notes?: string;
  createdAt: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string; // YYYY-MM-DD or ISO
  time?: string;
  paymentSource: PaymentSource;
  cardId?: string; // If paid with or to a credit card
  bankAccountId?: string; // If linked to a specific bank account
  bankName?: string; // Specific bank name for bank transactions
  toBankAccountId?: string; // For transfer between accounts
  loanId?: string; // If paid for a loan
  billId?: string; // If paid for a bill
  isDevir?: boolean; // Is initial/carryover balance
  createdAt: number;
}

export interface BankTheme {
  id: string;
  name: string;
  keywords: string[];
  gradient: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  accentNeon: string;
  chipColor: string;
  badgeBg: string;
  logoText?: string;
}

export interface CreditCard {
  id: string;
  bankName: string;
  cardName: string;
  cardNumberLast4: string;
  totalLimit: number;
  currentDebt: number; // Güncel borç
  cutoffDay: number; // Hesap kesim günü (1-31)
  dueDay: number; // Son ödeme günü (1-31)
  minPaymentRate: number; // Asgari ödeme oranı % (örn: 20 veya 40)
  themeId?: string; // Banka tema id'si
  customColorFrom?: string;
  customColorTo?: string;
  cardHolderName?: string;
  createdAt: number;
}

export interface Loan {
  id: string;
  bankName: string;
  loanTitle: string; // örn: İhtiyaç Kredisi, Araç Kredisi
  principalAmount: number; // Çekilen Ana Para
  totalRepayment: number; // Geri ödenecek toplam tutar (faizli)
  monthlyInstallment: number; // Aylık taksit
  totalInstallments: number; // Toplam taksit sayısı
  paidInstallments: number; // Ödenen taksit sayısı
  remainingDebt: number; // Kalan toplam borç
  nextDueDate: string; // Sıradaki taksit tarihi YYYY-MM-DD
  startDate: string;
  isCompleted: boolean;
  notes?: string;
  createdAt: number;
}

export type BillCategory =
  | 'electricity'
  | 'water'
  | 'gas'
  | 'internet'
  | 'phone'
  | 'rent'
  | 'dues'
  | 'market'
  | 'fuel'
  | 'subscription'
  | 'other'
  | string;

export interface Bill {
  id: string;
  title: string;
  category: BillCategory;
  amount: number;
  dueDay: number; // Ayın günü (1-31)
  dueDate: string; // Vade tarihi YYYY-MM-DD
  isPaid: boolean;
  lastPaidDate?: string;
  paidWithSource?: PaymentSource;
  paidWithCardId?: string;
  autoRenewMonthly: boolean; // Ödenince bir sonraki aya devret
  notes?: string;
  createdAt: number;
}

export interface CustomCategory {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color?: string;
  icon?: string;
  isDefault?: boolean;
}

export interface DueAlarmItem {
  id: string;
  type: 'card' | 'loan' | 'bill';
  title: string;
  amount: number;
  dueDate: string;
  daysRemaining: number;
  status: 'overdue' | 'today' | 'urgent' | 'upcoming' | 'paid';
  rawItem: CreditCard | Loan | Bill;
}

export interface CashbookStats {
  openingBalance: number; // Devreden Bakiye
  totalIncome: number;
  totalExpense: number;
  netCashBalance: number; // Kalan Kasa
  totalBankBalance: number;
  totalCreditCardDebt: number;
  totalCreditCardLimit: number;
  totalLoanDebt: number;
  totalPendingBills: number;
  netWorth: number; // Kasa + Banka - Kart Borçları - Kredi Borçları
}
