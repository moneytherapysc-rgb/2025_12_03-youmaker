
import React from 'react';
import { FaceFrownIcon, CheckCircleIcon } from './icons';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center relative animate-fade-in-up border border-slate-200 dark:border-slate-700"
        onClick={e => e.stopPropagation()}
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300 mb-6">
            <FaceFrownIcon className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            정말 떠나시겠어요?
        </h2>
        
        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-sm">
            구독을 취소하시면 아래의 <strong>PRO 혜택</strong>들을<br/>
            더 이상 이용하실 수 없습니다.
        </p>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 text-left mb-8 space-y-3 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                <span className="line-through decoration-slate-400">무제한 채널 분석 & 조회</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                <span className="line-through decoration-slate-400">AI 성장 전략 리포트</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <CheckCircleIcon className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                <span className="line-through decoration-slate-400">쇼츠 대본 & 썸네일 생성</span>
            </div>
        </div>

        <div className="space-y-3">
            <button
                onClick={onClose}
                className="w-full py-3.5 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg transition-transform hover:scale-[1.02]"
            >
                구독 유지하기
            </button>
            <button
                onClick={() => { alert('구독 취소 처리가 완료되었습니다. (테스트)'); onClose(); }}
                className="w-full py-3 text-sm font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline decoration-slate-300"
            >
                혜택 포기하고 취소하기
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

export default CancelSubscriptionModal;
