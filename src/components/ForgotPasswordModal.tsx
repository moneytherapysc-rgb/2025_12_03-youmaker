
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { KeyIcon, CheckCircleIcon, XMarkIcon } from './icons';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { checkEmailExists, resetPassword } = useAuth();
  
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const exists = await checkEmailExists(email);
      if (exists) {
        setStep('reset');
        setMessage('계정이 확인되었습니다. 새로운 비밀번호를 설정해주세요.');
      } else {
        setError('가입되지 않은 이메일 주소입니다.');
      }
    } catch (err: any) {
      setError('확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
        setError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    if (newPassword !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
    }

    setIsLoading(true);

    try {
      await resetPassword(email, newPassword);
      setMessage('비밀번호가 성공적으로 변경되었습니다!');
      setTimeout(() => {
          onClose();
          onSwitchToLogin();
          // Reset State
          setStep('email');
          setEmail('');
          setNewPassword('');
          setConfirmPassword('');
          setMessage(null);
      }, 2000);
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg max-w-md w-full text-center relative animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
         <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <XMarkIcon className="w-6 h-6"/>
        </button>

        <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <KeyIcon className="w-8 h-8" />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {step === 'email' ? '비밀번호 찾기' : '비밀번호 재설정'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {step === 'email' 
                ? '가입 시 사용한 이메일 주소를 입력해 주세요.' 
                : '새로운 비밀번호를 입력해 주세요.'}
        </p>
        
        {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
            </div>
        )}

        {message && !error && (
             <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-4 h-4" /> {message}
            </div>
        )}

        {step === 'email' ? (
            <form onSubmit={handleCheckEmail} className="space-y-4">
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일 주소"
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
                >
                    {isLoading ? '확인 중...' : '계정 확인'}
                </button>
            </form>
        ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="새 비밀번호 (6자 이상)"
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="새 비밀번호 확인"
                        required
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 dark:disabled:bg-indigo-800"
                >
                    {isLoading ? '변경 중...' : '비밀번호 변경하기'}
                </button>
            </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button 
                onClick={() => { onClose(); onSwitchToLogin(); }}
                className="text-slate-500 dark:text-slate-400 text-sm hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
                로그인으로 돌아가기
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

export default ForgotPasswordModal;
