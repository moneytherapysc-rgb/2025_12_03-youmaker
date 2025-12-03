
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { requestPayment, redeemCoupon, getSubscriptionPlans } from '../services/subscriptionService';
import { CheckCircleIcon, KeyIcon, StarIcon, UsersIcon, RocketIcon, FireIcon, GiftIcon } from './icons';
import type { SubscriptionPlan } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLoginModal: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onOpenLoginModal }) => {
  const { user, updateUserSubscription } = useAuth();
  const [activeTab, setActiveTab] = useState<'plans' | 'coupon'>('plans');
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
      if (isOpen) {
          // Load dynamic plans from storage
          setPlans(getSubscriptionPlans());
      }
  }, [isOpen]);

  if (!isOpen) return null;

  const eventPlan = plans.find(p => p.id === 'event_launch');
  const standardPlans = plans.filter(p => p.id !== 'event_launch');

  const handlePayment = async (planId: string) => {
    if (!user) {
        onClose();
        onOpenLoginModal();
        return;
    }
    
    setIsLoading(true);
    setMessage(null);

    try {
        // Trigger payment immediately for the selected plan
        const updatedUser = await requestPayment(user, planId);
        updateUserSubscription(updatedUser);
        setMessage({ type: 'success', text: '결제가 완료되었습니다! 멤버십이 활성화되었습니다.' });
        setTimeout(() => {
            onClose();
            setMessage(null);
        }, 2000);
    } catch (error: any) {
        // The error message from PortOne or cancellation
        setMessage({ type: 'error', text: error.message || '결제 처리에 실패했습니다.' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        onClose();
        onOpenLoginModal();
        return;
    }
    if (!couponCode.trim()) {
        setMessage({ type: 'error', text: '쿠폰 코드를 입력해주세요.' });
        return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
        const updatedUser = await redeemCoupon(user, couponCode.trim());
        updateUserSubscription(updatedUser);
        setMessage({ type: 'success', text: '쿠폰이 등록되었습니다! 멤버십이 활성화되었습니다.' });
        setTimeout(() => {
            onClose();
            setMessage(null);
            setCouponCode('');
        }, 2000);
    } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
    } finally {
        setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

  const getDailyPrice = (price: number, months: number) => {
      const days = months * 30; // Approx
      return Math.round(price / days);
  };

  const getPlanBadge = (id: string) => {
      if (id === '12months') return 'BEST Value';
      if (id === '3months') return 'Popular';
      return null;
  };

  const getPlanDescription = (id: string) => {
      if (id === '1month') return '가볍게 시작하는 입문용';
      if (id === '3months') return '본격적인 채널 성장';
      if (id === '12months') return '프로를 위한 최고의 가성비';
      return '';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-center relative shrink-0">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl font-light w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            >
                &times;
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">
                {activeTab === 'plans' ? '멤버십 업그레이드' : '쿠폰 등록'}
            </h2>
            <p className="text-slate-300 text-sm">
                {activeTab === 'plans' ? '타사 대비 압도적인 기능과 합리적인 가격으로 시작하세요.' : '보유하신 쿠폰 코드를 입력하여 이용권을 활성화하세요.'}
            </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
            <button
                onClick={() => { setActiveTab('plans'); setMessage(null); }}
                className={`flex-1 py-4 font-semibold text-sm transition-colors ${
                    activeTab === 'plans' 
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 bg-slate-50 dark:bg-slate-700/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                <div className="flex items-center justify-center gap-2">
                    <StarIcon /> 요금제 선택
                </div>
            </button>
            <button
                onClick={() => { setActiveTab('coupon'); setMessage(null); }}
                className={`flex-1 py-4 font-semibold text-sm transition-colors ${
                    activeTab === 'coupon' 
                    ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 bg-slate-50 dark:bg-slate-700/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
            >
                 <div className="flex items-center justify-center gap-2">
                    <KeyIcon /> 쿠폰 등록
                </div>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow bg-slate-50 dark:bg-slate-900/50">
            {message && (
                <div className={`mb-6 p-4 rounded-lg text-center text-sm font-bold ${
                    message.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {activeTab === 'plans' ? (
                <div className="space-y-8">
                    {/* Event Plan Banner */}
                    {eventPlan && (
                        <div className="relative bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-red-900 text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md">
                                500명 인원한정
                            </div>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-left">
                                    <h3 className="text-2xl font-extrabold mb-2 flex items-center gap-2">
                                        <FireIcon className="w-6 h-6 text-yellow-300" />
                                        {eventPlan.name}
                                    </h3>
                                    <p className="text-red-100 text-sm mb-1">{eventPlan.description}</p>
                                    <ul className="flex flex-wrap gap-4 mt-3 text-sm font-medium text-white/90">
                                        <li className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> 모든 기능 무제한</li>
                                        <li className="flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/> AI 컨설팅 포함</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col items-center md:items-end min-w-[160px]">
                                    <div className="text-3xl font-black tracking-tight">₩{formatPrice(eventPlan.price)}</div>
                                    <div className="text-xs font-bold text-yellow-200 mt-1">하루 약 {formatPrice(getDailyPrice(eventPlan.price, eventPlan.durationMonths))}원</div>
                                    <div className="text-sm opacity-80 mb-3 line-through">₩18,900</div>
                                    <button 
                                        onClick={() => handlePayment(eventPlan.id)}
                                        disabled={isLoading}
                                        className="w-full bg-white text-red-600 hover:bg-yellow-50 font-bold py-3 px-6 rounded-lg shadow-md transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? '처리 중...' : '지금 바로 시작하기'}
                                        {!isLoading && <i className="fas fa-arrow-right"></i>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Standard Plans */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                        {standardPlans.map((plan) => {
                            const badge = getPlanBadge(plan.id);
                            const isBest = plan.id === '12months';
                            const dailyCost = getDailyPrice(plan.price, plan.durationMonths);
                            
                            return (
                                <div 
                                    key={plan.id}
                                    className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm`}
                                >
                                    {badge && (
                                        <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold px-3 py-1 rounded-full text-white ${isBest ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-blue-500'}`}>
                                            {badge}
                                        </div>
                                    )}
                                    
                                    <div className="text-center mb-4">
                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1">{plan.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 h-8">{getPlanDescription(plan.id)}</p>
                                    </div>

                                    <div className="text-center mb-6">
                                        {plan.discount && (
                                            <span className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {plan.discount}% 할인
                                            </span>
                                        )}
                                        <div className="flex items-end justify-center gap-1 mt-2">
                                            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">₩{formatPrice(plan.price)}</span>
                                        </div>
                                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">하루 약 {formatPrice(dailyCost)}원</div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            {plan.id === '12months' ? `(월 ${formatPrice(Math.round(plan.price / 12))}원)` : '일시불 결제'}
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-4">
                                        <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2.5">
                                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> 무제한 채널 분석</li>
                                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> AI 성장 전략 리포트</li>
                                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> 숏폼 대본 생성기</li>
                                            <li className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-green-500"/> 썸네일 A/B 테스트</li>
                                        </ul>
                                    </div>

                                    <button 
                                        onClick={() => handlePayment(plan.id)}
                                        disabled={isLoading}
                                        className={`w-full py-3 rounded-lg flex items-center justify-center font-bold text-sm transition-colors shadow-md ${
                                            isLoading 
                                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500'
                                        }`}
                                    >
                                        {isLoading ? '처리 중...' : '선택하기'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="text-center max-w-md mx-auto mt-8">
                       {!user && (
                             <button
                                onClick={() => { onClose(); onOpenLoginModal(); }}
                                className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <UsersIcon className="w-5 h-5"/>
                                로그인하고 시작하기
                            </button>
                        )}
                       
                        {user && (
                            <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                                * 안전한 KG이니시스 결제 모듈을 사용합니다. (현재 테스트 모드)
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-md mx-auto py-4">
                    {/* Hooking Banner */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-5 text-white shadow-lg mb-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        <div className="relative z-10">
                            <div className="inline-block bg-white/20 p-2 rounded-full mb-3">
                                <GiftIcon className="w-6 h-6 text-yellow-300" />
                            </div>
                            <h3 className="text-xl font-bold mb-1">아직 망설여지시나요?</h3>
                            <p className="text-indigo-100 font-medium text-sm mb-4">
                                <span className="text-yellow-300 font-bold">2주 무료 체험권</span>으로 먼저 써보고 결정하세요!
                            </p>
                            <div className="bg-white/10 rounded-lg p-2 text-xs text-indigo-100 border border-white/20">
                                <p>💡 이벤트나 프로모션을 통해 2주 체험 코드를 받으셨나요?</p>
                                <p>아래에 입력하고 즉시 PRO 기능을 경험해보세요.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleRedeemCoupon} className="space-y-4">
                        <div className="text-center mb-2">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">쿠폰 코드를 입력하세요</h3>
                        </div>
                        <div>
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="XXXX-XXXX-XXXX"
                                className="w-full px-4 py-4 text-center text-xl tracking-widest font-mono bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 text-slate-800 dark:text-slate-100 uppercase shadow-sm transition-all focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
                            />
                        </div>
                        
                        {user ? (
                            <button
                                type="submit"
                                disabled={isLoading || !couponCode.trim()}
                                className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-lg"
                            >
                                {isLoading ? '확인 중...' : '쿠폰 등록하고 시작하기'}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => { onClose(); onOpenLoginModal(); }}
                                className="w-full py-4 text-lg font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <UsersIcon className="w-5 h-5"/>
                                로그인하고 등록하기
                            </button>
                        )}
                    </form>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
