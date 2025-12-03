
import React, { useState, useEffect } from 'react';
import { 
    setYouTubeApiKey, getYouTubeApiKey, 
    setGeminiApiKey, getGeminiApiKey, 
    testApiKey, testGeminiApiKey 
} from '../services/youtubeService';
import { EyeIcon, EyeOffIcon, TrashIcon, XMarkIcon, KeyIcon, RocketIcon, CheckCircleIcon, ExclamationCircleIcon } from './icons';

interface ApiKeyMessageProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySubmit: () => void;
}

const ApiKeyMessage: React.FC<ApiKeyMessageProps> = ({ isOpen, onClose, onKeySubmit }) => {
  const [youtubeKey, setYoutubeKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  const [isYoutubeVisible, setIsYoutubeVisible] = useState(false);
  const [isGeminiVisible, setIsGeminiVisible] = useState(false);
  
  // Separate states for testing
  const [ytStatus, setYtStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [ytMessage, setYtMessage] = useState('');

  const [geminiStatus, setGeminiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [geminiMessage, setGeminiMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setYoutubeKey(getYouTubeApiKey() || '');
      setGeminiKey(getGeminiApiKey() || '');
      setYtStatus('idle');
      setYtMessage('');
      setGeminiStatus('idle');
      setGeminiMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestYoutube = async () => {
    if (!youtubeKey.trim()) {
      setYtStatus('error');
      setYtMessage('YouTube API 키를 입력해주세요.');
      return;
    }
    setYtStatus('testing');
    setYtMessage('확인 중...');
    
    const result = await testApiKey(youtubeKey.trim());

    if (result.success) {
      setYtStatus('success');
      setYtMessage('YouTube API 키가 유효합니다.');
    } else {
      setYtStatus('error');
      setYtMessage(result.error?.message || '유효하지 않은 키입니다.');
    }
  };

  const handleTestGemini = async () => {
    if (!geminiKey.trim()) {
      setGeminiStatus('error');
      setGeminiMessage('Gemini API 키를 입력해주세요.');
      return;
    }
    setGeminiStatus('testing');
    setGeminiMessage('확인 중...');
    
    const result = await testGeminiApiKey(geminiKey.trim());

    if (result.success) {
      setGeminiStatus('success');
      setGeminiMessage('Gemini API 키가 유효합니다.');
    } else {
      setGeminiStatus('error');
      setGeminiMessage('유효하지 않은 키입니다. (Generative Language API 활성화 필요)');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeKey.trim() && geminiKey.trim()) {
      setYouTubeApiKey(youtubeKey.trim());
      setGeminiApiKey(geminiKey.trim());
      onKeySubmit();
    } else {
        // Just a gentle alert, though form shouldn't submit if disabled
        alert('두 개의 키를 모두 입력해야 합니다.');
    }
  };

  const handleResetKey = () => {
      if(window.confirm('저장된 모든 API 키를 삭제하시겠습니까?')) {
          setYouTubeApiKey('');
          setGeminiApiKey('');
          setYoutubeKey('');
          setGeminiKey('');
          setYtStatus('idle'); setYtMessage('');
          setGeminiStatus('idle'); setGeminiMessage('');
      }
  };
  
  const StatusMessage = ({ status, message }: { status: string, message: string }) => {
      if (status === 'idle' || !message) return null;
      
      let colorClass = 'text-slate-500';
      let icon = null;

      if (status === 'testing') {
          colorClass = 'text-blue-500';
          icon = <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>;
      } else if (status === 'success') {
          colorClass = 'text-green-500';
          icon = <CheckCircleIcon className="w-4 h-4" />;
      } else if (status === 'error') {
          colorClass = 'text-red-500';
          icon = <ExclamationCircleIcon className="w-4 h-4" />;
      }

      return (
          <div className={`text-xs mt-2 flex items-center gap-1.5 ${colorClass} font-medium animate-fade-in-up`}>
              {icon}
              <span>{message}</span>
          </div>
      );
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-[9999] flex justify-center items-center p-4 transition-opacity"
      onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-xl w-full text-center border-t-4 border-red-500 relative animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fade-in-up 0.3s ease-out' }}
      >
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white p-2 rounded-full transition-all"
          aria-label="닫기"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        
        <div className="flex justify-center mb-4 text-red-500">
          <KeyIcon className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">API 키 설정</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
          원활한 서비스 이용을 위해 <strong>두 가지 API 키</strong>가 모두 필요합니다.<br/>
          <span className="text-slate-400 text-xs">(키는 브라우저에만 안전하게 저장됩니다)</span>
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-5 text-left">
          
          {/* YouTube API Key Input */}
          <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <i className="fab fa-youtube text-red-600"></i> YouTube Data API Key
              </label>
              <div className="relative">
                <input
                  type={isYoutubeVisible ? 'text' : 'password'}
                  value={youtubeKey}
                  onChange={(e) => setYoutubeKey(e.target.value)}
                  placeholder="AIzaSy... (데이터 수집용)"
                  className={`w-full pl-4 pr-12 py-3 text-sm bg-slate-50 dark:bg-slate-700 dark:text-slate-100 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition ${ytStatus === 'error' ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                />
                <button
                    type="button"
                    onClick={() => setIsYoutubeVisible(!isYoutubeVisible)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    {isYoutubeVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <StatusMessage status={ytStatus} message={ytMessage} />
          </div>

          {/* Gemini API Key Input */}
          <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                  <RocketIcon className="w-4 h-4 text-blue-500" /> Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={isGeminiVisible ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy... (AI 생성/분석용)"
                  className={`w-full pl-4 pr-12 py-3 text-sm bg-slate-50 dark:bg-slate-700 dark:text-slate-100 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${geminiStatus === 'error' ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                />
                <button
                    type="button"
                    onClick={() => setIsGeminiVisible(!isGeminiVisible)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                    {isGeminiVisible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <StatusMessage status={geminiStatus} message={geminiMessage} />
              <p className="text-xs text-slate-400 mt-1">
                  * <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-blue-500">Google AI Studio</a>에서 무료로 발급받을 수 있습니다.
              </p>
          </div>

          {/* Buttons */}
          <div className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={handleTestYoutube}
                    className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm border border-slate-200 dark:border-slate-600"
                    disabled={!youtubeKey.trim()}
                >
                    YouTube 키 테스트
                </button>
                <button
                    type="button"
                    onClick={handleTestGemini}
                    className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm border border-slate-200 dark:border-slate-600"
                    disabled={!geminiKey.trim()}
                >
                    Gemini 키 테스트
                </button>
              </div>

              <div className="flex gap-3">
                <button
                    type="button"
                    onClick={handleResetKey}
                    className="flex-shrink-0 bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 py-3 px-4 rounded-lg hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors border border-slate-200 dark:border-slate-600"
                    title="초기화"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!youtubeKey.trim() || !geminiKey.trim()}
                >
                    저장하고 시작하기
                </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyMessage;
