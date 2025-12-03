
import React from 'react';
import { ClockIcon, StarIcon, XMarkIcon } from './icons';

interface SubscriptionNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing: () => void;
  type: 'expired' | 'warning';
  daysLeft?: number;
}

const SubscriptionNotificationModal: React.FC<SubscriptionNotificationModalProps> = ({ isOpen, onClose, onOpenPricing, type, daysLeft }) => {
  if (!isOpen) return null;

  const isExpired = type === 'expired';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border-t-4 relative animate-fade-in-up ${isExpired ? 'border-red-600' : 'border-yellow-500'}`}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          &times;
        </button>

        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isExpired ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
            <ClockIcon className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isExpired ? '이용권 기간이 만료되었습니다' : '이용권 만료 임박!'}
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            {isExpired ? (
                <>
                    모든 PRO 기능을 계속 이용하시려면<br/>
                    멤버십을 갱신해주세요.
                </>
            ) : (
                <>
                    현재 이용 중인 플랜이 <span className="font-bold text-yellow-600 dark:text-yellow-400">{daysLeft}일 후</span> 만료됩니다.<br/>
                    끊김 없는 서비스 이용을 위해 연장해주세요.
                </>
            )}
        </p>

        <div className="space-y-3">
            <button
                onClick={() => { onClose(); onOpenPricing(); }}
                className={`w-full py-3.5 text-lg font-bold text-white rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 ${isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
                <StarIcon className="w-5 h-5" />
                {isExpired ? '멤버십 갱신하기' : '기간 연장하기'}
            </button>
            <button
                onClick={onClose}
                className="w-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
                다음에 할게요
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionNotificationModal;
