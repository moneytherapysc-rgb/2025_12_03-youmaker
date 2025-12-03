
import React, { useState, useEffect } from 'react';
import { generateCoupons, getCoupons, getSubscriptionPlans, updatePlanPrice, resetPlansToDefault } from '../services/subscriptionService';
import type { Coupon, User, SubscriptionPlan } from '../types';
import { CopyIcon, UsersIcon, KeyIcon, BeakerIcon, MoneyIcon, CheckIcon, RocketIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

interface AdminDashboardProps {
    onTriggerAlert?: (type: 'expired' | 'warning') => void;
    onTriggerCancelTest?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onTriggerAlert, onTriggerCancelTest }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'coupons' | 'members' | 'system'>('plans');
  
  // Coupon State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [duration, setDuration] = useState<0.5 | 1 | 3 | 6 | 12>(1);
  const [count, setCount] = useState(1);
  const [generatedCoupons, setGeneratedCoupons] = useState<Coupon[]>([]);

  // Member Management
  const { getAllUsers, deleteUser } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Plan Management
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeTab === 'coupons') {
        loadCoupons();
    } else if (activeTab === 'members') {
        loadMembers();
    } else if (activeTab === 'plans') {
        loadPlans();
    }
  }, [activeTab]);

  const loadCoupons = () => {
    const all = getCoupons();
    setCoupons(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const loadMembers = () => {
      const users = getAllUsers();
      setRegisteredUsers(users.sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()));
  };

  const loadPlans = () => {
      const currentPlans = getSubscriptionPlans();
      setPlans(currentPlans);
      // Initialize editing state
      const initialPrices: Record<string, number> = {};
      currentPlans.forEach(p => initialPrices[p.id] = p.price);
      setEditingPrices(initialPrices);
  };

  const handleGenerate = () => {
    const newBatch = generateCoupons(duration, count);
    setGeneratedCoupons(newBatch);
    loadCoupons();
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleForceDeleteMember = (email: string) => {
      if(email === 'admin@test.com') {
          alert('최고 관리자 계정은 삭제할 수 없습니다.');
          return;
      }
      if(window.confirm(`[주의] ${email} 회원을 강제 탈퇴시키겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
          deleteUser(email);
          loadMembers(); // Refresh list
      }
  };

  const handlePriceChange = (id: string, value: string) => {
      setEditingPrices(prev => ({
          ...prev,
          [id]: Number(value)
      }));
  };

  const handleSavePrice = (id: string) => {
      const newPrice = editingPrices[id];
      updatePlanPrice(id, newPrice);
      loadPlans();
      alert('가격이 변경되었습니다.');
  };

  const handleResetPlans = () => {
      if(window.confirm('모든 요금제 설정을 초기값으로 되돌리시겠습니까?')) {
          resetPlansToDefault();
          loadPlans();
      }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('ko-KR').format(price);

  const formatPlanName = (plan?: string) => {
      switch(plan) {
          case '1month': return '1개월권';
          case '3months': return '3개월권';
          case '6months': return '6개월권';
          case '12months': return '12개월권';
          case 'trial': return '체험판(2주)';
          default: return '무료';
      }
  };

  const formatCouponDuration = (duration: number) => {
      if (duration === 0.5) return '2주(체험)';
      return `${duration}개월`;
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shrink-0">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">관리자 대시보드</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">서비스 운영에 필요한 기능들을 관리하세요.</p>
                </div>
            </div>
            
            <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('plans')}
                    className={`pb-3 px-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'plans' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <MoneyIcon className="w-5 h-5" />
                    요금제 관리
                </button>
                <button
                    onClick={() => setActiveTab('coupons')}
                    className={`pb-3 px-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'coupons' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <KeyIcon className="w-5 h-5" />
                    쿠폰 관리
                </button>
                <button
                    onClick={() => setActiveTab('members')}
                    className={`pb-3 px-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'members' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <UsersIcon className="w-5 h-5" />
                    회원 관리
                </button>
                <button
                    onClick={() => setActiveTab('system')}
                    className={`pb-3 px-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'system' 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <BeakerIcon className="w-5 h-5" />
                    시스템 테스트
                </button>
            </div>
        </div>

        {activeTab === 'plans' && (
            <div className="flex-grow min-h-0 animate-fade-in-up">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <RocketIcon className="w-6 h-6 text-blue-500" /> 구독 플랜 가격 설정
                        </h3>
                        <button 
                            onClick={handleResetPlans}
                            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded transition-colors"
                        >
                            초기값으로 복원
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                                <tr>
                                    <th scope="col" className="px-6 py-3">플랜명</th>
                                    <th scope="col" className="px-6 py-3">기간 (개월)</th>
                                    <th scope="col" className="px-6 py-3">현재 가격</th>
                                    <th scope="col" className="px-6 py-3">가격 수정 (KRW)</th>
                                    <th scope="col" className="px-6 py-3 text-center">동작</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                        <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                            {plan.name}
                                        </th>
                                        <td className="px-6 py-4">
                                            {plan.durationMonths}개월
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                            ₩{formatPrice(plan.price)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-400">₩</span>
                                                <input 
                                                    type="number" 
                                                    value={editingPrices[plan.id] || 0} 
                                                    onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                                                    className="w-32 pl-7 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => handleSavePrice(plan.id)}
                                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center justify-center gap-1 mx-auto"
                                            >
                                                <CheckIcon className="w-4 h-4" /> 저장
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                        * 가격을 수정하고 '저장' 버튼을 누르면 즉시 모든 사용자의 결제창에 반영됩니다.
                    </p>
                </div>
            </div>
        )}

        {activeTab === 'coupons' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow min-h-0 animate-fade-in-up">
                {/* Generator Panel */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <i className="fas fa-magic text-blue-500"></i> 쿠폰 생성기
                    </h3>
                    
                    <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">이용권 기간</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setDuration(0.5)}
                                    className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                                        duration === 0.5 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    2주(체험)
                                </button>
                                {[1, 3, 6, 12].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => setDuration(m as any)}
                                        className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                                            duration === m 
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        {m}개월
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">생성 개수</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="50" 
                                value={count} 
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <button 
                            onClick={handleGenerate}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
                        >
                            코드 생성하기
                        </button>

                        {generatedCoupons.length > 0 && (
                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in-up">
                                <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">방금 생성된 코드</h4>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-4 max-h-40 overflow-y-auto space-y-2">
                                    {generatedCoupons.map(coupon => (
                                        <div key={coupon.id} className="flex justify-between items-center text-sm group">
                                            <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">{coupon.code}</code>
                                            <button 
                                                onClick={() => copyToClipboard(coupon.code)} 
                                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100" 
                                                title="복사"
                                            >
                                                <CopyIcon />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* List Panel */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 flex-grow">
                        <div className="flex justify-between items-end mb-6 shrink-0">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                <i className="fas fa-list text-slate-500"></i> 전체 쿠폰 목록 ({coupons.length})
                            </h3>
                            <button onClick={loadCoupons} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                                <i className="fas fa-sync-alt mr-1"></i> 새로고침
                            </button>
                        </div>

                        <div className="overflow-auto flex-grow custom-scrollbar h-0 min-h-[300px]">
                            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 rounded-tl-lg">코드</th>
                                        <th scope="col" className="px-6 py-3 text-center">기간</th>
                                        <th scope="col" className="px-6 py-3 text-center">상태</th>
                                        <th scope="col" className="px-6 py-3">생성일</th>
                                        <th scope="col" className="px-6 py-3 rounded-tr-lg">사용자</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 group">
                                                {coupon.code}
                                                <button 
                                                    onClick={() => copyToClipboard(coupon.code)} 
                                                    className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" 
                                                    title="복사"
                                                >
                                                    <CopyIcon />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">{formatCouponDuration(coupon.durationMonths)}</td>
                                            <td className="px-6 py-4 text-center">
                                                {coupon.isUsed ? (
                                                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">사용됨</span>
                                                ) : (
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">사용가능</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">{new Date(coupon.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-xs whitespace-nowrap">
                                                {coupon.isUsed ? (
                                                    <div>
                                                        <div className="font-semibold text-slate-700 dark:text-slate-200">{coupon.usedBy}</div>
                                                        <div className="text-slate-400">{new Date(coupon.usedAt!).toLocaleDateString()}</div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {coupons.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">생성된 쿠폰이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'members' && (
            <div className="flex-grow min-h-0 animate-fade-in-up flex flex-col">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col border border-slate-200 dark:border-slate-700 flex-grow overflow-hidden">
                    <div className="flex justify-between items-center mb-6 shrink-0">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <UsersIcon className="w-6 h-6 text-blue-500" /> 가입 회원 목록 ({registeredUsers.length})
                        </h3>
                        <button onClick={loadMembers} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            <i className="fas fa-sync-alt mr-1"></i> 새로고침
                        </button>
                    </div>

                    <div className="overflow-auto flex-grow custom-scrollbar">
                        <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700/50 dark:text-slate-300 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3 rounded-tl-lg">회원 정보</th>
                                    <th scope="col" className="px-6 py-3">이메일</th>
                                    <th scope="col" className="px-6 py-3 text-center">가입일</th>
                                    <th scope="col" className="px-6 py-3 text-center">구독 상태</th>
                                    <th scope="col" className="px-6 py-3 text-center rounded-tr-lg">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {registeredUsers.map((user) => (
                                    <tr key={user.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                {user.name}
                                                {user.email === 'admin@test.com' && <span className="text-xs bg-slate-200 dark:bg-slate-600 px-1.5 rounded text-slate-600 dark:text-slate-300">ADMIN</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {new Date(user.joinedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.subscription?.status === 'active' ? (
                                                <div>
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
                                                        {formatPlanName(user.subscription.plan)}
                                                    </span>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        ~{new Date(user.subscription.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs">무료 회원</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {user.email !== 'admin@test.com' && (
                                                <button 
                                                    onClick={() => handleForceDeleteMember(user.email)}
                                                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 px-3 py-1.5 rounded border border-red-200 dark:border-red-800 transition-colors"
                                                >
                                                    강제 탈퇴
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {registeredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">가입된 회원이 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'system' && (
            <div className="flex-grow min-h-0 animate-fade-in-up">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 flex flex-col border border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                        <BeakerIcon className="w-6 h-6 text-purple-500" /> 시스템 알림 테스트 (팝업 확인용)
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
                        아래 버튼을 클릭하여 멤버십 만료 또는 임박 시 사용자에게 표시되는 팝업 디자인과 기능을 미리 확인해볼 수 있습니다.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => onTriggerAlert && onTriggerAlert('expired')}
                            className="px-6 py-4 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-xl font-bold border border-red-200 dark:border-red-800 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-times-circle text-xl"></i>
                            만료 알림 테스트
                        </button>
                        
                        <button
                            onClick={() => onTriggerAlert && onTriggerAlert('warning')}
                            className="px-6 py-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 dark:text-yellow-300 rounded-xl font-bold border border-yellow-200 dark:border-yellow-800 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-exclamation-triangle text-xl"></i>
                            임박 알림 테스트 (5일 전)
                        </button>

                        <button
                            onClick={onTriggerCancelTest}
                            className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl font-bold border border-slate-200 dark:border-slate-600 transition-all transform hover:scale-105 shadow-sm flex items-center justify-center gap-3"
                        >
                            <i className="fas fa-user-slash text-xl"></i>
                            구독 취소 방어 알림 테스트
                        </button>
                    </div>
                </div>
            </div>
        )}

        <style>{`
            .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: rgba(156, 163, 175, 0.5);
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: rgba(156, 163, 175, 0.8);
            }
             @keyframes fade-in-up {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out forwards;
            }
        `}</style>
    </div>
  );
};

export default AdminDashboard;
