import { CreditCard, Loan, Bill, DueAlarmItem } from '../types';
import { getDaysDifference, getNextDueDayDate } from './formatters';

export function collectAllDueAlarms(
  cards: CreditCard[],
  loans: Loan[],
  bills: Bill[]
): DueAlarmItem[] {
  const alarms: DueAlarmItem[] = [];

  // 1. Credit Cards with debt
  cards.forEach((card) => {
    if (card.currentDebt > 0 && card.dueDay) {
      const dueDate = getNextDueDayDate(card.dueDay);
      const daysLeft = getDaysDifference(dueDate);

      let status: DueAlarmItem['status'] = 'upcoming';
      if (daysLeft < 0) status = 'overdue';
      else if (daysLeft === 0) status = 'today';
      else if (daysLeft <= 3) status = 'urgent';

      alarms.push({
        id: `alarm_card_${card.id}`,
        type: 'card',
        title: `${card.bankName} - ${card.cardName} (Son 4 Hane: ${card.cardNumberLast4})`,
        amount: card.currentDebt,
        dueDate,
        daysRemaining: daysLeft,
        status,
        rawItem: card,
      });
    }
  });

  // 2. Loans (uncompleted)
  loans.forEach((loan) => {
    if (!loan.isCompleted && loan.nextDueDate) {
      const daysLeft = getDaysDifference(loan.nextDueDate);

      let status: DueAlarmItem['status'] = 'upcoming';
      if (daysLeft < 0) status = 'overdue';
      else if (daysLeft === 0) status = 'today';
      else if (daysLeft <= 3) status = 'urgent';

      alarms.push({
        id: `alarm_loan_${loan.id}`,
        type: 'loan',
        title: `${loan.bankName} - ${loan.loanTitle} (${loan.paidInstallments + 1}/${loan.totalInstallments}. Taksit)`,
        amount: loan.monthlyInstallment,
        dueDate: loan.nextDueDate,
        daysRemaining: daysLeft,
        status,
        rawItem: loan,
      });
    }
  });

  // 3. Unpaid Bills
  bills.forEach((bill) => {
    if (!bill.isPaid && bill.dueDate) {
      const daysLeft = getDaysDifference(bill.dueDate);

      let status: DueAlarmItem['status'] = 'upcoming';
      if (daysLeft < 0) status = 'overdue';
      else if (daysLeft === 0) status = 'today';
      else if (daysLeft <= 3) status = 'urgent';

      alarms.push({
        id: `alarm_bill_${bill.id}`,
        type: 'bill',
        title: bill.title,
        amount: bill.amount,
        dueDate: bill.dueDate,
        daysRemaining: daysLeft,
        status,
        rawItem: bill,
      });
    }
  });

  // Sort by urgency: overdue first, then today, then nearest days
  alarms.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return alarms;
}
