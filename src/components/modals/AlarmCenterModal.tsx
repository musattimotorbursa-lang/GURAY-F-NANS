import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  Calendar,
  CreditCard,
  Landmark,
  Receipt,
  Volume2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { DueAlarmItem, CreditCard as CardType, Loan, Bill } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { soundFx, requestNotificationPermission } from '../../utils/audioNotification';

interface AlarmCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  alarms: DueAlarmItem[];
  onOpenCardPay: (card: CardType) => void;
  onOpenLoanPay: (loan: Loan) => void;
  onOpenBillPay: (bill: Bill) => void;
}

export const AlarmCenterModal: React.FC<AlarmCenterModalProps> = ({
  isOpen,
  onClose,
  alarms,
  onOpenCardPay,
  onOpenLoanPay,
  onOpenBillPay,
}) => {
  if (!isOpen) return null;

  const urgentCount = alarms.filter(
    (a) => a.status === 'overdue' || a.status === 'today' || a.status === 'urgent'
  ).length;

  const handleTestSound = () => {
    soundFx.playAlarm();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      soundFx.playSuccess();
      alert('Bildirim izni başarıyla verildi! Yaklaşan ödemeleriniz cihazınızda uyarılacaktır.');
    } else {
      alert('Bildirim izni verilmedi veya tarayıcı tarafından engellendi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#11111f] border border-amber-600/40 p-5 sm:p-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ödeme Alarm & Hatırlatıcı</h3>
              <p className="text-xs text-slate-400">
                {urgentCount > 0 ? `${urgentCount} adet acil ödeme yaklaşıyor` : 'Tüm ödemeler kontrol altında'}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons: Test Alarm & Enable Browser Notifications */}
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
          <button
            onClick={handleTestSound}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Alarm Sesini Çal</span>
          </button>

          <button
            onClick={handleEnableNotifications}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 text-xs font-semibold text-purple-300 border border-purple-500/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bildirimleri Aç</span>
          </button>
        </div>

        {/* Alarms List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {alarms.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-200">Harika! Yaklaşan borç veya fatura yok.</p>
              <p className="text-xs text-slate-500">Tüm kredi kartları, taksitler ve faturalar güncel.</p>
            </div>
          ) : (
            alarms.map((alarm) => {
              const isOverdue = alarm.status === 'overdue';
              const isToday = alarm.status === 'today';
              const isUrgent = alarm.status === 'urgent';

              return (
                <div
                  key={alarm.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-950/30 border-rose-600/50'
                      : isToday
                      ? 'bg-red-950/30 border-red-500/60 animate-pulse'
                      : isUrgent
                      ? 'bg-amber-950/30 border-amber-600/50'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        alarm.type === 'card'
                          ? 'bg-fuchsia-500/20 text-fuchsia-400'
                          : alarm.type === 'loan'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-pink-500/20 text-pink-400'
                      }`}
                    >
                      {alarm.type === 'card' && <CreditCard className="w-4 h-4" />}
                      {alarm.type === 'loan' && <Landmark className="w-4 h-4" />}
                      {alarm.type === 'bill' && <Receipt className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.2 rounded uppercase ${
                            isOverdue
                              ? 'bg-rose-600 text-white'
                              : isToday
                              ? 'bg-red-600 text-white'
                              : isUrgent
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-700 text-slate-200'
                          }`}
                        >
                          {isOverdue
                            ? `${Math.abs(alarm.daysRemaining)} Gün Gecikti`
                            : isToday
                            ? 'Bugün Son Gün'
                            : isUrgent
                            ? `Son ${alarm.daysRemaining} Gün`
                            : `${alarm.daysRemaining} Gün Kaldı`}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {alarm.type === 'card'
                            ? 'Kart Borcu'
                            : alarm.type === 'loan'
                            ? 'Kredi Taksiti'
                            : 'Fatura'}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-100 truncate mt-0.5">
                        {alarm.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">Vade: {formatDate(alarm.dueDate)}</p>
                    </div>
                  </div>

                  {/* Amount & Pay Shortcut */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-extrabold block ${
                        isOverdue || isToday ? 'text-rose-400' : 'text-slate-100'
                      }`}
                    >
                      {formatCurrency(alarm.amount)}
                    </span>

                    <button
                      onClick={() => {
                        onClose();
                        if (alarm.type === 'card') onOpenCardPay(alarm.rawItem as CardType);
                        else if (alarm.type === 'loan') onOpenLoanPay(alarm.rawItem as Loan);
                        else if (alarm.type === 'bill') onOpenBillPay(alarm.rawItem as Bill);
                      }}
                      className="mt-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow transition-all active:scale-95"
                    >
                      Öde
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
