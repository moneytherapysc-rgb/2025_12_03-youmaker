
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, StarIcon, ClockIcon } from './icons';
import { getPlanLabel } from '../services/subscriptionService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to open pricing modal logic (Assuming App.tsx handles the actual modal opening via state, 
  // but here we might need a prop if we want to trigger it directly. 
  // For now, we will assume user closes this and opens pricing manually or we add a prop later.
  // Actually, let's keep it simple: Show the info, and maybe emit an event or rely on user navigation)
  // Re-reading requirements: "유료결제 하라는 팝업도 띄워줘" - this is handled in App.tsx expiration check.
  // Here we just show the info.

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
        setMessage({ type: 'error', text: '새 비밀번호는 최소 6자 이상이어야 합니다.' });
        return;
    }

    if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
        return;
    }

    setIsLoading(true);
    try {
        await changePassword(currentPassword, newPassword);
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
            onClose();
            setMessage(null);
        }, 2000);
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message || '비밀번호 변경에 실패했습니다.' });
    } finally {
        setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('ko-KR', { 
          year: 'numeric', month: 'long', day: 'numeric' 
      });
  };

  const isSubscribed = user.subscription && user.subscription.status === 'active';
  const isExpired = user.subscription && new Date(user.subscription.endDate) < new Date();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg max-w-md w-full relative animate-fade-in-up flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          &times;
        </button>

        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">마이페이지</h2>
            <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-inner ring-4 ring-indigo-100 dark:ring-indigo-900 mx-auto mb-4">
                {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 mb-6" />

        {/* Subscription Info Section */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500" /> 내 구독 정보
            </h3>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600">
                {user.subscription ? (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400">현재 플랜</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                {getPlanLabel(user.subscription.plan)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400">상태</span>
                            {isExpired ? (
                                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded dark:bg-red-900/30 dark:text-red-400">만료됨</span>
                            ) : (
                                <span className="text-xs font-bold bg-green-100 text-green-600 px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400">이용 중</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500 dark:text-slate-400">시작일</span>
                            <span className="text-slate-700 dark:text-slate-200 text-sm">{formatDate(user.subscription.startDate)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-600">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                <ClockIcon className="w-4 h-4"/> 만료일
                            </span>
                            <span className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                                {formatDate(user.subscription.endDate)}
                            </span>
                        </div>
                        
                        {/* Extension/Renewal Message */}
                        {isExpired && (
                            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded text-center">
                                이용권이 만료되었습니다. 서비스를 계속 이용하시려면 연장해주세요.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">현재 이용 중인 유료 플랜이 없습니다.</p>
                        <p className="text-xs text-slate-400">무료 회원으로 이용 중입니다.</p>
                    </div>
                )}
            </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-700 mb-6" />

        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">비밀번호 변경</h3>

        {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${
                message.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
                {message.text}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">현재 비밀번호</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 사용 중인 비밀번호"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">새 비밀번호</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="변경할 비밀번호 (6자 이상)"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">새 비밀번호 확인</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 mt-4 shadow-md"
            >
                {isLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
        </form>
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

export default ProfileModal;
