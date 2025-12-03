
import React from 'react';
import { 
    CalendarIcon, ChartBarIcon, RocketIcon, YouTubeIcon, ChatBubbleIcon, 
    PencilIcon, PhotoIcon, SwordsIcon, FireIcon, LightningIcon 
} from './icons';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing?: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{title}</h3>
        <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{children}</div>
    </div>
);

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-500">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">{title}</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose, onOpenPricing }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg max-w-4xl w-full text-left border-t-4 border-red-500 relative animate-fade-in-up max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                <i className="fas fa-book-open text-red-500 mr-2"></i>
                사용 설명서
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="닫기"
            >
            &times;
            </button>
        </div>

        <div className="overflow-y-auto pr-2 flex-grow">
            
            {/* 1. 자세한 사용법 (Notion Link) */}
            <div className="bg-slate-100 dark:bg-slate-700/50 p-6 rounded-xl text-center mb-10 border border-slate-200 dark:border-slate-600">
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-3">자세한 사용법</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
                    유메이커의 모든 기능을 100% 활용하는 방법을 노션 가이드에서 확인하세요.<br/>
                    API 키 발급부터 기능별 꿀팁까지 상세하게 정리되어 있습니다.
                </p>
                <a 
                    href="https://spurious-chocolate-dbb.notion.site/2b80b6e474e2804a830bc8f1293d66b3?source=copy_link" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors gap-2"
                >
                    <i className="fas fa-external-link-alt"></i> 사용 가이드 보러가기
                </a>
            </div>

            {/* 2. 요금제 및 멤버십 안내 */}
            <Section title="요금제 및 멤버십 안내">
                <p className="mb-4 text-sm">유메이커는 합리적인 가격으로 최고의 AI 분석 기능을 제공합니다.</p>
                
                {/* Clickable Banner for Pricing */}
                <button 
                    onClick={() => {
                        onClose();
                        if (onOpenPricing) onOpenPricing();
                    }}
                    className="w-full mb-6 p-4 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl text-white shadow-lg text-left hover:scale-[1.01] transition-transform cursor-pointer group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">클릭하여 이동 &rarr;</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <h5 className="font-extrabold text-lg">🎉 오픈 기념 초특가</h5>
                        <span className="bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full">500명 인원한정</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black">₩9,900</span>
                        <span className="text-sm opacity-80 mb-1">/ 1개월</span>
                    </div>
                    <p className="text-sm font-bold text-yellow-200 mt-1">하루 약 330원</p>
                    <p className="text-xs mt-2 opacity-90">
                        한달 커피 두잔값으로 AI 기능을 무제한 체험해보세요.
                    </p>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                        <h5 className="font-bold text-slate-800 dark:text-white mb-1">스타터 플랜</h5>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">₩18,900</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">하루 약 630원</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600 text-center">
                        <h5 className="font-bold text-slate-800 dark:text-white mb-1">그로스 플랜</h5>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">₩49,900</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">하루 약 554원</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border-2 border-blue-500 relative text-center">
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full">BEST</div>
                        <h5 className="font-bold text-slate-800 dark:text-white mb-1">프로 플랜</h5>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">₩169,000</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">하루 약 463원</p>
                    </div>
                </div>
            </Section>

            {/* 3. 주요 기능 가이드 (사이드바 순서) */}
            <Section title="주요 기능 완벽 가이드">
                
                {/* 원클릭 분석 */}
                <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-3 mt-2 px-2 border-l-4 border-blue-500">원클릭 분석</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <FeatureItem 
                        icon={<ChartBarIcon className="w-5 h-5"/>}
                        title="채널 정밀 분석"
                        desc="특정 채널의 모든 영상을 분석하여 성과 지표와 AI 성장 전략(경쟁 전략, 성장 과정, 컨설팅)을 도출합니다."
                    />
                    <FeatureItem 
                        icon={<YouTubeIcon className="w-5 h-5"/>}
                        title="떡상 영상 분석"
                        desc="특정 키워드의 상위 노출 영상을 심층 분석하여 벤치마킹할 포인트를 찾아냅니다."
                    />
                    <FeatureItem 
                        icon={<ChatBubbleIcon className="w-5 h-5"/>}
                        title="댓글 민심 분석"
                        desc="영상 댓글을 AI가 분석하여 시청자의 긍정/부정 여론과 핵심 피드백을 5줄로 요약합니다."
                    />
                    <FeatureItem 
                        icon={<PencilIcon className="w-5 h-5"/>}
                        title="스크립트 벤치마킹"
                        desc="성공한 영상의 대본을 입력하면 AI가 분석, 요약 후 내 채널에 맞는 새로운 대본으로 재창조합니다."
                    />
                    <FeatureItem 
                        icon={<PhotoIcon className="w-5 h-5"/>}
                        title="썸네일 클리닉"
                        desc="내 썸네일 이미지를 업로드하면 AI가 CTR(클릭률) 점수를 예측하고 개선점을 피드백합니다."
                    />
                    <FeatureItem 
                        icon={<SwordsIcon className="w-5 h-5"/>}
                        title="채널 전투력 비교"
                        desc="내 채널과 경쟁 채널을 1:1로 비교하여 구독자, 조회수, 성장세 등 능력치를 분석합니다."
                    />
                </div>

                {/* 실시간 트렌드 */}
                <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-3 px-2 border-l-4 border-orange-500">실시간 트렌드</h4>
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <FeatureItem 
                        icon={<FireIcon className="w-5 h-5"/>}
                        title="급상승 트렌드"
                        desc="현재 유튜브에서 인기 급상승 중인 동영상과 라이징 크리에이터 정보를 실시간으로 확인합니다."
                    />
                    <FeatureItem 
                        icon={<RocketIcon className="w-5 h-5"/>}
                        title="실시간 뉴스 트렌드"
                        desc="네이버 뉴스의 실시간 헤드라인 30개를 빠르게 수집하여 오늘의 이슈를 파악합니다."
                    />
                </div>

                {/* 크리에이티브 도구 */}
                <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-3 px-2 border-l-4 border-yellow-500">크리에이티브 도구</h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <FeatureItem 
                        icon={<LightningIcon className="w-5 h-5"/>}
                        title="쇼츠 대본 생성"
                        desc="키워드만 입력하면 '1000만 조회수 전문가' AI가 후킹-본문-결말 구조의 쇼츠 대본 5개를 생성합니다."
                    />
                </div>

            </Section>
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

export default GuideModal;
