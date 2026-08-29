/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Transaction,
  CreditCard,
  Loan,
  Bill,
  PaymentSource,
  CustomCategory,
  BankAccount,
} from './types';
import {
  getStoredTransactions,
  saveStoredTransactions,
  getStoredCards,
  saveStoredCards,
  getStoredLoans,
  saveStoredLoans,
  getStoredBills,
  saveStoredBills,
  getStoredBankAccounts,
  saveStoredBankAccounts,
  getStoredCategories,
  saveStoredCategories,
  calculateCashStats,
  checkAndPerformAutoMidnightDevir,
} from './utils/storage';
import { collectAllDueAlarms } from './utils/alarms';
import { soundFx } from './utils/audioNotification';
import { getTodayString, getNextDueDayDate } from './utils/formatters';

// Layout & View Components
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { CashbookView } from './components/CashbookView';
import { CreditCardsView } from './components/CreditCardsView';
import { BankAccountsView } from './components/BankAccountsView';
import { LoansView } from './components/LoansView';
import { BillsView } from './components/BillsView';
import { ReportsView } from './components/ReportsView';

// Modals
import { TransactionModal } from './components/modals/TransactionModal';
import { CardModal } from './components/modals/CardModal';
import { CardPaymentModal } from './components/modals/CardPaymentModal';
import { CardSpendModal } from './components/modals/CardSpendModal';
import { BankAccountModal } from './components/modals/BankAccountModal';
import { BankTransferModal } from './components/modals/BankTransferModal';
import { LoanModal } from './components/modals/LoanModal';
import { LoanPaymentModal } from './components/modals/LoanPaymentModal';
import { BillModal } from './components/modals/BillModal';
import { BillPaymentModal } from './components/modals/BillPaymentModal';
import { DevirModal } from './components/modals/DevirModal';
import { AlarmCenterModal } from './components/modals/AlarmCenterModal';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal';
import { CalendarModal } from './components/modals/CalendarModal';
import { CategoryManagerModal } from './components/modals/CategoryManagerModal';

export default function App() {
  // Primary persistent states
  const [transactions, setTransactions] = useState<Transaction[]>(() => getStoredTransactions());
  const [cards, setCards] = useState<CreditCard[]>(() => getStoredCards());
  const [loans, setLoans] = useState<Loan[]>(() => getStoredLoans());
  const [bills, setBills] = useState<Bill[]>(() => getStoredBills());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => getStoredBankAccounts());
  const [categories, setCategories] = useState<CustomCategory[]>(() => getStoredCategories());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('cashbook');

  // Modal Visibility States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [txModalDate, setTxModalDate] = useState<string | undefined>(undefined);
  const [initialBankAccountIdForTx, setInitialBankAccountIdForTx] = useState<string | undefined>(undefined);

  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [selectedCardForPay, setSelectedCardForPay] = useState<CreditCard | null>(null);
  const [selectedCardForSpend, setSelectedCardForSpend] = useState<CreditCard | null>(null);

  const [isBankAccountModalOpen, setIsBankAccountModalOpen] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [selectedLoanForPay, setSelectedLoanForPay] = useState<Loan | null>(null);

  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedBillForPay, setSelectedBillForPay] = useState<Bill | null>(null);

  const [isDevirModalOpen, setIsDevirModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Theme state (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('kasa_app_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('kasa_app_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
    } else {
      document.documentElement.classList.add('theme-dark');
      document.documentElement.classList.remove('theme-light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    soundFx.playPop();
  };

  // Automated midnight rollover check on mount and periodic timer
  useEffect(() => {
    const runAutoDevir = () => {
      const autoDevirTx = checkAndPerformAutoMidnightDevir();
      if (autoDevirTx) {
        setTransactions(getStoredTransactions());
      }
    };

    runAutoDevir();

    // Check every 60 seconds for 00:00 midnight rollover
    const interval = setInterval(runAutoDevir, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveStoredCards(cards);
  }, [cards]);

  useEffect(() => {
    saveStoredLoans(loans);
  }, [loans]);

  useEffect(() => {
    saveStoredBills(bills);
  }, [bills]);

  useEffect(() => {
    saveStoredBankAccounts(bankAccounts);
  }, [bankAccounts]);

  useEffect(() => {
    saveStoredCategories(categories);
  }, [categories]);

  // Financial Stats & Alarms Calculation
  const stats = useMemo(() => {
    return calculateCashStats(transactions, cards, loans, bills, bankAccounts);
  }, [transactions, cards, loans, bills, bankAccounts]);

  const alarms = useMemo(() => {
    return collectAllDueAlarms(cards, loans, bills);
  }, [cards, loans, bills]);

  const urgentBillsCount = alarms.filter(
    (a) => a.type === 'bill' && (a.status === 'overdue' || a.status === 'today' || a.status === 'urgent')
  ).length;
  const urgentCardsCount = alarms.filter(
    (a) => a.type === 'card' && (a.status === 'overdue' || a.status === 'today' || a.status === 'urgent')
  ).length;
  const urgentLoansCount = alarms.filter(
    (a) => a.type === 'loan' && (a.status === 'overdue' || a.status === 'today' || a.status === 'urgent')
  ).length;

  const reloadAllData = useCallback(() => {
    setTransactions(getStoredTransactions());
    setCards(getStoredCards());
    setLoans(getStoredLoans());
    setBills(getStoredBills());
    setBankAccounts(getStoredBankAccounts());
    setCategories(getStoredCategories());
  }, []);

  // -------------------------------------------------------------
  // 1. Transaction Handlers
  // -------------------------------------------------------------
  const handleOpenNewTransaction = (
    type: 'income' | 'expense',
    initialDate?: string,
    bankAccountId?: string
  ) => {
    setEditingTransaction(null);
    setTxModalType(type);
    setTxModalDate(initialDate);
    setInitialBankAccountIdForTx(bankAccountId);
    setIsTxModalOpen(true);
    soundFx.playPop();
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTxModalType(tx.type === 'income' ? 'income' : 'expense');
    setTxModalDate(tx.date);
    setInitialBankAccountIdForTx(tx.bankAccountId);
    setIsTxModalOpen(true);
    soundFx.playPop();
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Bu işlemi silmek istediğinize emin misiniz?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      soundFx.playPop();
    }
  };

  const handleSaveTransaction = (txData: Partial<Transaction>, cardIdToUpdate?: string) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? ({ ...t, ...txData } as Transaction) : t))
      );
      soundFx.playSuccess();
    } else {
      const newTx: Transaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: txData.type || 'expense',
        amount: txData.amount || 0,
        category: txData.category || 'Genel',
        description: txData.description || '',
        date: txData.date || getTodayString(),
        paymentSource: txData.paymentSource || 'cash',
        cardId: txData.cardId,
        bankName: txData.bankName,
        bankAccountId: txData.bankAccountId,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);

      // If paid by credit card, increase card debt (which deducts available limit)!
      if (newTx.paymentSource === 'card' && (cardIdToUpdate || newTx.cardId)) {
        const targetCardId = cardIdToUpdate || newTx.cardId;
        setCards((prev) =>
          prev.map((c) =>
            c.id === targetCardId
              ? { ...c, currentDebt: (c.currentDebt || 0) + newTx.amount }
              : c
          )
        );
      }
      soundFx.playSuccess();
    }
  };

  // -------------------------------------------------------------
  // 2. Credit Card Handlers
  // -------------------------------------------------------------
  const handleOpenNewCard = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
    soundFx.playPop();
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
    soundFx.playPop();
  };

  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Bu kredi kartını silmek istediğinize emin misiniz?')) {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      soundFx.playPop();
    }
  };

  const handleSaveCard = (cardData: Partial<CreditCard>) => {
    if (editingCard) {
      setCards((prev) =>
        prev.map((c) => (c.id === editingCard.id ? ({ ...c, ...cardData } as CreditCard) : c))
      );
      soundFx.playSuccess();
    } else {
      const newCard: CreditCard = {
        id: `card_${Date.now()}`,
        bankName: cardData.bankName || 'Banka',
        cardName: cardData.cardName || 'Kredi Kartı',
        cardNumberLast4: cardData.cardNumberLast4 || '0000',
        totalLimit: cardData.totalLimit || 0,
        currentDebt: cardData.currentDebt || 0,
        cutoffDay: cardData.cutoffDay || 10,
        dueDay: cardData.dueDay || 20,
        minPaymentRate: cardData.minPaymentRate || 20,
        cardHolderName: cardData.cardHolderName || 'KULLANICI',
        themeId: cardData.themeId,
        createdAt: Date.now(),
      };
      setCards((prev) => [...prev, newCard]);
      soundFx.playSuccess();
    }
  };

  // Kart Borcu Ödeme (Otomatik Limit Artışı & Kasadan/Bankadan Düşme)
  const handleConfirmCardPayment = (
    cardId: string,
    amount: number,
    source: PaymentSource,
    bankName?: string,
    bankAccountId?: string
  ) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    // 1. Reduce card debt (increases available limit)
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, currentDebt: Math.max(0, (c.currentDebt || 0) - amount) } : c
      )
    );

    // 2. Add expense transaction to Cashbook
    const paymentTx: Transaction = {
      id: `tx_cardpay_${Date.now()}`,
      type: 'expense',
      amount,
      category: 'Kredi Kartı Ödemesi',
      description: `${card.bankName} (${card.cardName}) Kart Borcu Ödemesi ${
        source === 'bank' ? `(${bankName || 'Banka Hesabı'})` : '(Nakit)'
      }`,
      date: getTodayString(),
      paymentSource: source,
      cardId: card.id,
      bankName: source === 'bank' ? bankName : undefined,
      bankAccountId: source === 'bank' ? bankAccountId : undefined,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [paymentTx, ...prev]);

    soundFx.playSuccess();
  };

  // Kart ile Harcama Yapma (Otomatik Limit Düşüşü & Kasa Gideri)
  const handleConfirmCardSpend = (
    cardId: string,
    amount: number,
    category: string,
    description: string
  ) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    // 1. Increase card debt (decreases available limit)
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, currentDebt: (c.currentDebt || 0) + amount } : c
      )
    );

    // 2. Add expense to Cashbook with source 'card'
    const spendTx: Transaction = {
      id: `tx_cardspend_${Date.now()}`,
      type: 'expense',
      amount,
      category,
      description: `${description} (${card.bankName} ${card.cardName})`,
      date: getTodayString(),
      paymentSource: 'card',
      cardId: card.id,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [spendTx, ...prev]);

    soundFx.playSuccess();
  };

  // -------------------------------------------------------------
  // 3. Bank Account Handlers
  // -------------------------------------------------------------
  const handleOpenNewBankAccount = () => {
    setEditingBankAccount(null);
    setIsBankAccountModalOpen(true);
    soundFx.playPop();
  };

  const handleEditBankAccount = (acc: BankAccount) => {
    setEditingBankAccount(acc);
    setIsBankAccountModalOpen(true);
    soundFx.playPop();
  };

  const handleDeleteBankAccount = (accId: string) => {
    if (window.confirm('Bu banka hesabını silmek istediğinize emin misiniz? (Geçmiş işlemler korunur)')) {
      setBankAccounts((prev) => prev.filter((b) => b.id !== accId));
      soundFx.playPop();
    }
  };

  const handleSaveBankAccount = (accData: Partial<BankAccount>) => {
    if (editingBankAccount) {
      setBankAccounts((prev) =>
        prev.map((b) => (b.id === editingBankAccount.id ? ({ ...b, ...accData } as BankAccount) : b))
      );
      soundFx.playSuccess();
    } else {
      const newAcc: BankAccount = {
        id: `bank_${Date.now()}`,
        bankName: accData.bankName || 'Banka',
        accountName: accData.accountName || 'Vadesiz TL Hesabı',
        accountType: accData.accountType || 'checking',
        iban: accData.iban,
        initialBalance: accData.initialBalance || 0,
        currency: accData.currency || 'TRY',
        color: accData.color || '#0ea5e9',
        isDefault: accData.isDefault || false,
        createdAt: Date.now(),
      };
      setBankAccounts((prev) => [...prev, newAcc]);
      soundFx.playSuccess();
    }
  };

  // Execute transfer between Bank<->Bank, Cash<->Bank, Bank<->Cash
  const handleExecuteTransfer = (
    fromType: 'cash' | 'bank',
    fromAccountId: string | undefined,
    toType: 'cash' | 'bank',
    toAccountId: string | undefined,
    amount: number,
    description: string
  ) => {
    const today = getTodayString();
    const fromAcc = bankAccounts.find((b) => b.id === fromAccountId);
    const toAcc = bankAccounts.find((b) => b.id === toAccountId);

    const fromLabel = fromType === 'cash' ? 'Nakit Kasa' : `${fromAcc?.bankName} (${fromAcc?.accountName})`;
    const toLabel = toType === 'cash' ? 'Nakit Kasa' : `${toAcc?.bankName} (${toAcc?.accountName})`;

    // Transfer Out transaction
    const txOut: Transaction = {
      id: `tx_tr_out_${Date.now()}`,
      type: 'expense',
      amount,
      category: 'Hesaplar Arası Transfer',
      description: `${fromLabel} ➔ ${toLabel} Transfer (${description || 'Virman'})`,
      date: today,
      paymentSource: fromType === 'cash' ? 'cash' : 'bank',
      bankAccountId: fromType === 'bank' ? fromAccountId : undefined,
      bankName: fromType === 'bank' ? fromAcc?.bankName : undefined,
      createdAt: Date.now(),
    };

    // Transfer In transaction
    const txIn: Transaction = {
      id: `tx_tr_in_${Date.now() + 1}`,
      type: 'income',
      amount,
      category: 'Hesaplar Arası Transfer',
      description: `${fromLabel} ➔ ${toLabel} Transfer Girişi (${description || 'Virman'})`,
      date: today,
      paymentSource: toType === 'cash' ? 'cash' : 'bank',
      bankAccountId: toType === 'bank' ? toAccountId : undefined,
      bankName: toType === 'bank' ? toAcc?.bankName : undefined,
      createdAt: Date.now() + 1,
    };

    setTransactions((prev) => [txOut, txIn, ...prev]);
    soundFx.playSuccess();
  };

  // -------------------------------------------------------------
  // 4. Loan Handlers
  // -------------------------------------------------------------
  const handleOpenNewLoan = () => {
    setEditingLoan(null);
    setIsLoanModalOpen(true);
    soundFx.playPop();
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setIsLoanModalOpen(true);
    soundFx.playPop();
  };

  const handleDeleteLoan = (loanId: string) => {
    if (window.confirm('Bu krediyi silmek istediğinize emin misiniz?')) {
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
      soundFx.playPop();
    }
  };

  const handleSaveLoan = (loanData: Partial<Loan>) => {
    if (editingLoan) {
      setLoans((prev) =>
        prev.map((l) => (l.id === editingLoan.id ? ({ ...l, ...loanData } as Loan) : l))
      );
      soundFx.playSuccess();
    } else {
      const newLoan: Loan = {
        id: `loan_${Date.now()}`,
        bankName: loanData.bankName || 'Banka',
        loanTitle: loanData.loanTitle || 'Kredi',
        principalAmount: loanData.principalAmount || 0,
        totalRepayment: loanData.totalRepayment || 0,
        monthlyInstallment: loanData.monthlyInstallment || 0,
        totalInstallments: loanData.totalInstallments || 1,
        paidInstallments: loanData.paidInstallments || 0,
        remainingDebt: loanData.remainingDebt || loanData.totalRepayment || 0,
        nextDueDate: loanData.nextDueDate || getNextDueDayDate(15),
        startDate: loanData.startDate || getTodayString(),
        isCompleted: false,
        notes: loanData.notes,
        createdAt: Date.now(),
      };
      setLoans((prev) => [...prev, newLoan]);
      soundFx.playSuccess();
    }
  };

  // Kredi Taksiti Ödeme (Otomatik Kredi Borcundan & Taksit Sayısından Düşme)
  const handleConfirmLoanPayment = (
    loanId: string,
    amount: number,
    source: PaymentSource,
    bankName?: string,
    bankAccountId?: string
  ) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return;

    const newPaidCount = loan.paidInstallments + 1;
    const newRemainingDebt = Math.max(0, loan.remainingDebt - amount);
    const isNowCompleted = newRemainingDebt <= 0 || newPaidCount >= loan.totalInstallments;

    // Calculate next month due date
    const currentDate = new Date(loan.nextDueDate || getTodayString());
    currentDate.setMonth(currentDate.getMonth() + 1);
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    const nextMonthDueDate = `${y}-${m}-${d}`;

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              paidInstallments: newPaidCount,
              remainingDebt: newRemainingDebt,
              nextDueDate: nextMonthDueDate,
              isCompleted: isNowCompleted,
            }
          : l
      )
    );

    // Record expense in cashbook
    const loanTx: Transaction = {
      id: `tx_loanpay_${Date.now()}`,
      type: 'expense',
      amount,
      category: 'Kredi / Borç Ödemesi',
      description: `${loan.bankName} - ${loan.loanTitle} (${newPaidCount}. Taksit Ödemesi)`,
      date: getTodayString(),
      paymentSource: source,
      loanId: loan.id,
      bankName: source === 'bank' ? bankName : undefined,
      bankAccountId: source === 'bank' ? bankAccountId : undefined,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [loanTx, ...prev]);

    soundFx.playSuccess();
  };

  // -------------------------------------------------------------
  // 5. Bill Handlers with Granular Payment Source (Bank/Card/Cash)
  // -------------------------------------------------------------
  const handleOpenNewBill = () => {
    setEditingBill(null);
    setIsBillModalOpen(true);
    soundFx.playPop();
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setIsBillModalOpen(true);
    soundFx.playPop();
  };

  const handleDeleteBill = (billId: string) => {
    if (window.confirm('Bu faturayı silmek istediğinize emin misiniz?')) {
      setBills((prev) => prev.filter((b) => b.id !== billId));
      soundFx.playPop();
    }
  };

  const handleSaveBill = (billData: Partial<Bill>) => {
    if (editingBill) {
      setBills((prev) =>
        prev.map((b) => (b.id === editingBill.id ? ({ ...b, ...billData } as Bill) : b))
      );
      soundFx.playSuccess();
    } else {
      const newBill: Bill = {
        id: `bill_${Date.now()}`,
        title: billData.title || 'Fatura',
        category: billData.category || 'phone',
        amount: billData.amount || 0,
        dueDay: billData.dueDay || 15,
        dueDate: billData.dueDate || getNextDueDayDate(15),
        isPaid: false,
        autoRenewMonthly: billData.autoRenewMonthly !== false,
        notes: billData.notes,
        createdAt: Date.now(),
      };
      setBills((prev) => [...prev, newBill]);
      soundFx.playSuccess();
    }
  };

  // Fatura Ödeme Tetikleyici (Modalı açar)
  const handleOpenPayBillModal = (bill: Bill) => {
    setSelectedBillForPay(bill);
    soundFx.playPop();
  };

  // Fatura Ödemesini Onaylama (Banka / Kredi Kartı / Nakit)
  const handleConfirmBillPayment = (
    bill: Bill,
    source: PaymentSource,
    cardId?: string,
    bankName?: string,
    bankAccountId?: string
  ) => {
    // 1. Mark bill as paid with source
    setBills((prev) =>
      prev.map((b) =>
        b.id === bill.id
          ? {
              ...b,
              isPaid: true,
              lastPaidDate: getTodayString(),
              paidWithSource: source,
              paidWithCardId: cardId,
            }
          : b
      )
    );

    // 2. If paid by credit card, deduct from card's limit (increase card debt)
    if (source === 'card' && cardId) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, currentDebt: (c.currentDebt || 0) + bill.amount }
            : c
        )
      );
    }

    // 3. Add expense transaction
    const selectedCard = cards.find((c) => c.id === cardId);
    const sourceDesc =
      source === 'card' && selectedCard
        ? `(${selectedCard.bankName} ${selectedCard.cardName})`
        : source === 'bank'
        ? `(${bankName || 'Banka Hesabı'})`
        : '(Nakit Kasa)';

    const billTx: Transaction = {
      id: `tx_bill_${Date.now()}`,
      type: 'expense',
      amount: bill.amount,
      category: 'Fatura & Abonelik',
      description: `${bill.title} Fatura Ödemesi ${sourceDesc}`,
      date: getTodayString(),
      paymentSource: source,
      cardId: source === 'card' ? cardId : undefined,
      bankName: source === 'bank' ? bankName : undefined,
      bankAccountId: source === 'bank' ? bankAccountId : undefined,
      billId: bill.id,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [billTx, ...prev]);

    soundFx.playSuccess();
  };

  const handleResetBillStatus = (bill: Bill) => {
    const nextDate = getNextDueDayDate(bill.dueDay);
    setBills((prev) =>
      prev.map((b) =>
        b.id === bill.id
          ? {
              ...b,
              isPaid: false,
              dueDate: nextDate,
              paidWithSource: undefined,
              paidWithCardId: undefined,
            }
          : b
      )
    );
    soundFx.playPop();
  };

  // -------------------------------------------------------------
  // 6. Devir Handlers (Gün Sonu Kasa Kapatma & Yeni Devir Başlatma)
  // -------------------------------------------------------------
  const handleConfirmDevir = (newOpeningBalance: number, notes: string) => {
    const devirTx: Transaction = {
      id: `tx_devir_${Date.now()}`,
      type: 'income',
      amount: newOpeningBalance,
      category: 'Kasa Devri',
      description: notes || 'Gün Sonu Kasa Devri',
      date: getTodayString(),
      paymentSource: 'cash',
      isDevir: true,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [devirTx, ...prev]);
    soundFx.playSuccess();
  };

  // -------------------------------------------------------------
  // 7. Category Management Handlers
  // -------------------------------------------------------------
  const handleSaveCategory = (catData: Partial<CustomCategory>) => {
    if (catData.id) {
      setCategories((prev) =>
        prev.map((c) => (c.id === catData.id ? ({ ...c, ...catData } as CustomCategory) : c))
      );
    } else {
      const newCat: CustomCategory = {
        id: `cat_${Date.now()}`,
        name: catData.name || 'Yeni Kategori',
        type: catData.type || 'expense',
        color: catData.color || '#a855f7',
        icon: catData.icon || 'Tags',
        isDefault: false,
      };
      setCategories((prev) => [...prev, newCat]);
    }
    soundFx.playSuccess();
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    soundFx.playPop();
  };

  return (
    <div
      className={`min-h-screen ${
        theme === 'light' ? 'bg-[#f8fafc] text-slate-900 theme-light' : 'bg-[#0a0a14] text-slate-100 theme-dark'
      } flex flex-col justify-between font-sans selection:bg-purple-600 selection:text-white transition-colors duration-200`}
    >
      {/* Top Header with live clock, theme toggle & calendar trigger */}
      <Header
        stats={stats}
        alarms={alarms}
        activeTab={activeTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenAlarms={() => setIsAlarmModalOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onNewTransaction={handleOpenNewTransaction}
      />

      {/* Main View Container */}
      <main className="max-w-6xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-6 flex-1">
        {activeTab === 'cashbook' && (
          <CashbookView
            transactions={transactions}
            stats={stats}
            onOpenNewTransaction={handleOpenNewTransaction}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenDevirModal={() => setIsDevirModalOpen(true)}
          />
        )}

        {activeTab === 'cards' && (
          <CreditCardsView
            cards={cards}
            onOpenNewCardModal={handleOpenNewCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onOpenPayDebtModal={(c) => {
              setSelectedCardForPay(c);
            }}
            onOpenSpendCardModal={(c) => {
              setSelectedCardForSpend(c);
            }}
          />
        )}

        {activeTab === 'bank_accounts' && (
          <BankAccountsView
            bankAccounts={bankAccounts}
            transactions={transactions}
            onOpenNewAccountModal={handleOpenNewBankAccount}
            onEditAccount={handleEditBankAccount}
            onDeleteAccount={handleDeleteBankAccount}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onDepositToAccount={(acc) => {
              handleOpenNewTransaction('income', undefined, acc.id);
            }}
            onWithdrawFromAccount={(acc) => {
              handleOpenNewTransaction('expense', undefined, acc.id);
            }}
          />
        )}

        {activeTab === 'loans' && (
          <LoansView
            loans={loans}
            onOpenNewLoanModal={handleOpenNewLoan}
            onEditLoan={handleEditLoan}
            onDeleteLoan={handleDeleteLoan}
            onOpenPayInstallmentModal={(l) => {
              setSelectedLoanForPay(l);
            }}
          />
        )}

        {activeTab === 'bills' && (
          <BillsView
            bills={bills}
            onOpenNewBillModal={handleOpenNewBill}
            onEditBill={handleEditBill}
            onDeleteBill={handleDeleteBill}
            onPayBill={handleOpenPayBillModal}
            onResetBillStatus={handleResetBillStatus}
            onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            stats={stats}
            transactions={transactions}
            cards={cards}
            loans={loans}
            bills={bills}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile & Responsive Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => {
          setActiveTab(t);
          soundFx.playPop();
        }}
        urgentBillsCount={urgentBillsCount}
        urgentCardsCount={urgentCardsCount}
        urgentLoansCount={urgentLoansCount}
      />

      {/* ----------------- MODALS ----------------- */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleSaveTransaction}
        initialType={txModalType}
        editingTransaction={editingTransaction}
        cards={cards}
        bankAccounts={bankAccounts}
        categories={categories}
        onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
        initialDate={txModalDate}
        initialBankAccountId={initialBankAccountIdForTx}
      />

      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleSaveCard}
        editingCard={editingCard}
      />

      <CardPaymentModal
        isOpen={!!selectedCardForPay}
        onClose={() => setSelectedCardForPay(null)}
        card={selectedCardForPay}
        bankAccounts={bankAccounts}
        onConfirmPayment={handleConfirmCardPayment}
      />

      <CardSpendModal
        isOpen={!!selectedCardForSpend}
        onClose={() => setSelectedCardForSpend(null)}
        card={selectedCardForSpend}
        onConfirmSpend={handleConfirmCardSpend}
      />

      <BankAccountModal
        isOpen={isBankAccountModalOpen}
        onClose={() => setIsBankAccountModalOpen(false)}
        onSave={handleSaveBankAccount}
        editingAccount={editingBankAccount}
      />

      <BankTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        bankAccounts={bankAccounts}
        cashBalance={stats.netCashOnHand}
        onConfirmTransfer={handleExecuteTransfer}
      />

      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSave={handleSaveLoan}
        editingLoan={editingLoan}
      />

      <LoanPaymentModal
        isOpen={!!selectedLoanForPay}
        onClose={() => setSelectedLoanForPay(null)}
        loan={selectedLoanForPay}
        bankAccounts={bankAccounts}
        onConfirmPayment={handleConfirmLoanPayment}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSave={handleSaveBill}
        editingBill={editingBill}
      />

      <BillPaymentModal
        isOpen={!!selectedBillForPay}
        onClose={() => setSelectedBillForPay(null)}
        bill={selectedBillForPay}
        cards={cards}
        cashBalance={stats.netCashOnHand}
        bankBalance={stats.totalBankBalance}
        bankAccounts={bankAccounts}
        onConfirmPayment={handleConfirmBillPayment}
      />

      <DevirModal
        isOpen={isDevirModalOpen}
        onClose={() => setIsDevirModalOpen(false)}
        stats={stats}
        onConfirmDevir={handleConfirmDevir}
      />

      <AlarmCenterModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
        alarms={alarms}
        onOpenCardPay={(card) => {
          setSelectedCardForPay(card);
        }}
        onOpenLoanPay={(loan) => {
          setSelectedLoanForPay(loan);
        }}
        onOpenBillPay={(bill) => {
          setSelectedBillForPay(bill);
        }}
      />

      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        cards={cards}
        loans={loans}
        bills={bills}
        transactions={transactions}
        onAddTransactionForDate={(dateStr) => {
          handleOpenNewTransaction('expense', dateStr);
        }}
      />

      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataReload={reloadAllData}
      />
    </div>
  );
}

