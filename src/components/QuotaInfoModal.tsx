
import React from 'react';
import { ExclamationCircleIcon, CheckCircleIcon } from './icons';

interface QuotaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuotaInfoModal: React.FC<QuotaInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl max-w-4xl w-full text-left border-t-4 border-blue-500 relative animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ExclamationCircleIcon className="w-7 h-7 text-blue-500" />
                필독 사항 (API 할당량 & 비용 안내)
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="닫기"
            >
            &times;
            </button>
        </div>

        <div className="overflow-y-auto pr-2 flex-grow space-y-8">
            
            {/* Intro Section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
                    YouTube Data API 일일 할당량: 10,000 unit
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Google Cloud Platform에서 무료로 제공하는 YouTube Data API의 하루 사용량 제한은 <strong>10,000 단위(unit)</strong>입니다.<br/>
                    각 기능마다 소모되는 할당량이 다르므로, 아래 표를 참고하여 효율적으로 사용해주세요.
                </p>
            </div>

            {/* High Cost Features */}
            <div>
                <h4 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    할당량 소모가 큰 기능 (주의 필요)
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">기능명</th>
                                <th scope="col" className="px-6 py-3">API 동작 방식</th>
                                <th scope="col" className="px-6 py-3 text-right">예상 소모량</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    떡상 영상 분석
                                </th>
                                <td className="px-6 py-4">
                                    키워드 검색(100) + 영상 상세 정보 조회(1)
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                                    약 100 ~ 500 unit<br/>
                                    <span className="text-xs font-normal text-slate-400">(검색 횟수에 따라 증가)</span>
                                </td>
                            </tr>
                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    채널 전투력 비교
                                </th>
                                <td className="px-6 py-4">
                                    두 채널 검색(100*2) + 영상 목록 조회
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-red-600 dark:text-red-400">
                                    약 200 ~ 250 unit
                                </td>
                            </tr>
                            <tr className="bg-white dark:bg-slate-800">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    채널 분석
                                </th>
                                <td className="px-6 py-4">
                                    채널 검색(100) + 영상 목록 조회(1)
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-orange-500">
                                    약 100 ~ 105 unit
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Low Cost Features */}
            <div>
                <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    할당량 소모가 적은 기능 (안심 사용)
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                    <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                            <tr>
                                <th scope="col" className="px-6 py-3">기능명</th>
                                <th scope="col" className="px-6 py-3 text-right">예상 소모량</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white dark:bg-slate-800 border-b dark:border-slate-700">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    급상승 트렌드
                                </th>
                                <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                    1 unit
                                </td>
                            </tr>
                            <tr className="bg-white dark:bg-slate-800">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                                    댓글 민심 분석
                                </th>
                                <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                                    1 unit
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Free Features */}
            <div>
                <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                    할당량 무제한 (Gemini AI 사용)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                        '키워드 분석 (검색량)',
                        'AI 스크립트 벤치마킹',
                        '쇼츠 아이디어 생성',
                        'AI 썸네일 클리닉',
                        '트렌드 예측 캘린더',
                        '실시간 트렌드 리포트'
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-indigo-500" />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800 text-sm text-slate-700 dark:text-slate-300">
                <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2">💡 할당량 관리 꿀팁</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li><strong>[떡상 영상 분석]</strong>은 꼭 필요한 경우에만 사용하고, 분석 개수를 조절하세요.</li>
                    <li>할당량은 한국 시간 기준 <strong>오후 5시(17:00)</strong>에 초기화됩니다. (PST 0시 기준)</li>
                    <li>할당량이 부족할 경우 Google Cloud Console에서 할당량 상향 요청(Audit)을 할 수 있습니다.</li>
                </ul>
            </div>

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

export default QuotaInfoModal;
