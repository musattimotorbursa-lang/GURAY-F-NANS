import React from 'react';
import {
  BookOpenText,
  CreditCard,
  Building2,
  HandCoins,
  Receipt,
  PieChart,
} from 'lucide-react';
import { TabType } from '../types';
export type { TabType };

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  urgentBillsCount: number;
  urgentCardsCount: number;
  urgentLoansCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  urgentBillsCount,
  urgentCardsCount,
  urgentLoansCount,
}) => {
  const tabs = [
    {
      id: 'cashbook' as TabType,
      label: 'Kasa Defteri',
      icon: BookOpenText,
      badge: 0,
      activeColor: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
    },
    {
      id: 'cards' as TabType,
      label: 'Kredi Kartları',
      icon: CreditCard,
      badge: urgentCardsCount,
      activeColor: 'text-fuchsia-400',
      activeBg: 'bg-fuchsia-500/15 border-fuchsia-500/30',
      glow: 'shadow-fuchsia-500/20',
    },
    {
      id: 'bank_accounts' as TabType,
      label: 'Banka Hesaplarım',
      icon: Building2,
      badge: 0,
      activeColor: 'text-sky-400',
      activeBg: 'bg-sky-500/15 border-sky-500/30',
      glow: 'shadow-sky-500/20',
    },
    {
      id: 'loans' as TabType,
      label: 'Krediler',
      icon: HandCoins,
      badge: urgentLoansCount,
      activeColor: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/30',
      glow: 'shadow-amber-500/20',
    },
    {
      id: 'bills' as TabType,
      label: 'Faturalar',
      icon: Receipt,
      badge: urgentBillsCount,
      activeColor: 'text-orange-400',
      activeBg: 'bg-orange-500/15 border-orange-500/30',
      glow: 'shadow-orange-500/20',
    },
    {
      id: 'reports' as TabType,
      label: 'Raporlar',
      icon: PieChart,
      badge: 0,
      activeColor: 'text-purple-400',
      activeBg: 'bg-purple-500/15 border-purple-500/30',
      glow: 'shadow-purple-500/20',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c16]/95 backdrop-blur-2xl border-t border-purple-900/30 pb-safe">
      <div className="max-w-2xl mx-auto px-1.5 sm:px-3 py-1.5 flex items-center justify-between gap-0.5 sm:gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 sm:py-1.5 px-1 sm:px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? `${tab.activeColor} ${tab.activeBg} border shadow-lg ${tab.glow} scale-105 font-bold`
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-3.5 h-3.5 sm:min-w-4 sm:h-4 px-1 bg-rose-500 text-white text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#0c0c16]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight mt-0.5 sm:mt-1 whitespace-nowrap text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
