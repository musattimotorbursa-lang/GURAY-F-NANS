import React, { useState, useEffect } from 'react';
import { X, Landmark } from 'lucide-react';
import { Loan } from '../../types';
import { getNextDueDayDate, getTodayString } from '../../utils/formatters';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Partial<Loan>) => void;
  editingLoan?: Loan | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLoan,
}) => {
  const [bankName, setBankName] = useState('Garanti BBVA');
  const [loanTitle, setLoanTitle] = useState('İhtiyaç Kredisi');
  const [principalAmount, setPrincipalAmount] = useState('100000');
  const [totalRepayment, setTotalRepayment] = useState('150000');
  const [monthlyInstallment, setMonthlyInstallment] = useState('4166');
  const [totalInstallments, setTotalInstallments] = useState('36');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [remainingDebt, setRemainingDebt] = useState('150000');
  const [nextDueDate, setNextDueDate] = useState(getNextDueDayDate(15));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingLoan) {
      setBankName(editingLoan.bankName);
      setLoanTitle(editingLoan.loanTitle);
      setPrincipalAmount(editingLoan.principalAmount.toString());
      setTotalRepayment(editingLoan.totalRepayment.toString());
      setMonthlyInstallment(editingLoan.monthlyInstallment.toString());
      setTotalInstallments(editingLoan.totalInstallments.toString());
      setPaidInstallments(editingLoan.paidInstallments.toString());
      setRemainingDebt(editingLoan.remainingDebt.toString());
      setNextDueDate(editingLoan.nextDueDate);
      setNotes(editingLoan.notes || '');
    } else {
      setBankName('Garanti BBVA');
      setLoanTitle('İhtiyaç Kredisi');
      setPrincipalAmount('100000');
      setTotalRepayment('150000');
      setMonthlyInstallment('4166');
      setTotalInstallments('36');
      setPaidInstallments('0');
      setRemainingDebt('150000');
      setNextDueDate(getNextDueDayDate(15));
      setNotes('');
    }
  }, [editingLoan, isOpen]);

  // Auto-calculate monthly installment when total repayment & installments change
  const handleRepaymentChange = (val: string) => {
    setTotalRepayment(val);
    const total = parseFloat(val) || 0;
    const count = parseInt(totalInstallments, 10) || 1;
    const monthly = Math.round(total / count);
    setMonthlyInstallment(monthly.toString());
    const paid = parseInt(paidInstallments, 10) || 0;
    setRemainingDebt((total - paid * monthly).toString());
  };

  const handleInstallmentsChange = (val: string) => {
    setTotalInstallments(val);
    const total = parseFloat(totalRepayment) || 0;
    const count = parseInt(val, 10) || 1;
    const monthly = Math.round(total / count);
    setMonthlyInstallment(monthly.toString());
    const paid = parseInt(paidInstallments, 10) || 0;
    setRemainingDebt((total - paid * monthly).toString());
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(principalAmount) || 0;
    const totalRepay = parseFloat(totalRepayment) || 0;
    const monthly = parseFloat(monthlyInstallment) || 0;
    const totalInst = parseInt(totalInstallments, 10) || 1;
    const paidInst = parseInt(paidInstallments, 10) || 0;
    const remaining = parseFloat(remainingDebt) || totalRepay - paidInst * monthly;

    onSave({
      id: editingLoan?.id,
      bankName,
      loanTitle,
      principalAmount: principal,
      totalRepayment: totalRepay,
      monthlyInstallment: monthly,
      totalInstallments: totalInst,
      paidInstallments: paidInst,
      remainingDebt: remaining,
      nextDueDate,
      startDate: editingLoan?.startDate || getTodayString(),
      isCompleted: remaining <= 0 || paidInst >= totalInst,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#11111f] border border-amber-800/40 p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingLoan ? 'Krediyi Düzenle' : 'Yeni Kredi / Borç Ekle'}
            </h3>
            <p className="text-xs text-slate-400">Taksit ödendikçe borç tutarı otomatik düşer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Banka / Kurum <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: Garanti, İş Bankası..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kredi Türü / Başlık <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Örn: İhtiyaç Kredisi, Taşıt..."
                value={loanTitle}
                onChange={(e) => setLoanTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Çekilen Ana Para (₺)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Örn: 100000"
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Geri Ödenecek Toplam (₺) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="Örn: 150000"
                value={totalRepayment}
                onChange={(e) => handleRepaymentChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Toplam Taksit</label>
              <input
                type="number"
                min={1}
                value={totalInstallments}
                onChange={(e) => handleInstallmentsChange(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-center text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Ödenen Taksit</label>
              <input
                type="number"
                min={0}
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-center text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Aylık Taksit (₺)</label>
              <input
                type="number"
                step="0.01"
                value={monthlyInstallment}
                onChange={(e) => setMonthlyInstallment(e.target.value)}
                className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-center text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kalan Borç (₺)</label>
              <input
                type="number"
                step="0.01"
                value={remainingDebt}
                onChange={(e) => setRemainingDebt(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sıradaki Taksit Tarihi</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-yellow-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notlar</label>
            <input
              type="text"
              placeholder="Örn: Erken kapama opsiyonlu, 2026 sonu bitiyor"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm shadow-xl shadow-amber-950/50 transition-all active:scale-[0.98]"
          >
            {editingLoan ? 'Krediyi Güncelle' : 'Krediyi Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
