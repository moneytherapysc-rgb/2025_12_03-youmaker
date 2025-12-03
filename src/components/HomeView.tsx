
import React from 'react';
import { ChartBarIcon, FireIcon, PencilIcon, PhotoIcon, ChatBubbleIcon, SwordsIcon, LightningIcon, YouTubeIcon, BookOpenIcon, HeadsetIcon, RocketIcon, StarIcon, MoneyIcon, CoffeeIcon, GiftIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';
import type { AppView } from '../types';
import { getPlanLabel } from '../services/subscriptionService';

interface HomeViewProps {
  onNavigate: (view: AppView) => void;
  onOpenPricingModal: () => void;
  onOpenGuideModal: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenPricingModal, onOpenGuideModal }) => {
  const { user } = useAuth();

  const formatDate = (dateString?: string) => {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('ko-KR', { 
          year: 'numeric', month: 'numeric', day: 'numeric' 
      });
  };

  const features = [
    {
      id: 'channel',
      title: '채널 분석',
      description: '채널의 성과를 분석하고 AI가 제안하는 맞춤형 성장 전략을 확인하세요.',
      icon: <ChartBarIcon className="w-6 h-6" />,
      colorClass: 'bg-blue-600',
      view: 'channel' as AppView,
      badge: 'PRO'
    },
    {
      id: 'news',
      title: '실시간 뉴스 트렌드',
      description: 'AI가 엄선한 실시간 뉴스 헤드라인과 요약을 카테고리별로 확인하세요.',
      icon: <RocketIcon className="w-6 h-6" />,
      colorClass: 'bg-green-600',
      view: 'news' as AppView,
      badge: 'PRO'
    },
    {
      id: 'keyword_video',
      title: '떡상 영상 분석',
      description: '최대 500개의 실제 영상을 크롤링하여 조회수, 경쟁도, 인기 분포를 정밀 분석합니다.',
      icon: <YouTubeIcon className="w-6 h-6" />,
      colorClass: 'bg-red-600',
      view: 'keyword_video' as AppView,
      badge: 'PRO'
    },
    {
      id: 'shorts_generator',
      title: '쇼츠 대본 생성',
      description: '키워드만 입력하면 3초 훅과 촬영 대본이 포함된 바이럴 쇼츠 기획안을 즉시 생성합니다.',
      icon: <LightningIcon className="w-6 h-6" />,
      colorClass: 'bg-yellow-500',
      view: 'shorts_generator' as AppView,
      badge: 'PRO'
    },
    {
      id: 'battle',
      title: '채널 전투력 비교',
      description: '라이벌 채널과 1:1로 구독자, 조회수, 성장세를 비교하고 승자를 가려보세요.',
      icon: <SwordsIcon className="w-6 h-6" />,
      colorClass: 'bg-slate-600',
      view: 'battle' as AppView,
      badge: 'PRO'
    },
    {
      id: 'thumbnail',
      title: 'AI 썸네일 클리닉',
      description: '썸네일을 업로드하면 AI가 CTR 점수를 매기고 A/B 테스트로 더 나은 시안을 골라줍니다.',
      icon: <PhotoIcon className="w-6 h-6" />,
      colorClass: 'bg-pink-500',
      view: 'thumbnail' as AppView,
      badge: 'PRO'
    },
    {
      id: 'script',
      title: 'AI 스크립트 벤치마킹',
      description: '성공한 영상의 대본을 AI가 분석하여 내 채널에 맞는 새로운 대본으로 재창조합니다.',
      icon: <PencilIcon className="w-6 h-6" />,
      colorClass: 'bg-purple-600',
      view: 'script' as AppView,
      badge: 'PRO'
    },
    {
      id: 'trending',
      title: '급상승 트렌드',
      description: '현재 유튜브 인기 급상승 영상과 라이징 크리에이터를 실시간으로 파악하세요.',
      icon: <FireIcon className="w-6 h-6" />,
      colorClass: 'bg-orange-600',
      view: 'trending' as AppView,
      badge: 'PRO'
    },
    {
      id: 'comment_analysis',
      title: '댓글 민심 분석',
      description: '영상 댓글을 AI가 분석하여 시청자의 긍정/부정 감정과 핵심 여론을 요약합니다.',
      icon: <ChatBubbleIcon className="w-6 h-6" />,
      colorClass: 'bg-indigo-600',
      view: 'comment_analysis' as AppView,
      badge: 'PRO'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 font-sans animate-fade-in-up">
      
      {/* 1. Header Section with Promo Cards */}
      <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                  <i className="fas fa-robot text-2xl"></i>
              </div>
              <h1 className="text-4xl font-black text-white tracking-tight">
                  YouTube <span className="text-red-500">Yumaker</span>
              </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
              유튜브 크리에이터를 위한 올인원 데이터 분석 솔루션.<br/>
              데이터 기반의 전략과 AI의 통찰력으로 채널을 빠르게 성장시키세요.
          </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Membership Card */}
          <div 
            onClick={onOpenPricingModal}
            className="bg-[#1e293b] p-5 rounded-xl border border-slate-700 shadow-lg flex items-start gap-4 cursor-pointer hover:border-blue-500 transition-colors group"
          >
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                  <StarIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">멤버십 이용 중</h3>
                  {user?.subscription ? (
                      <p className="text-slate-400 text-xs">
                          현재 <span className="text-blue-400 font-bold">{getPlanLabel(user.subscription.plan)}</span>을 이용하고 있습니다.<br/>
                          <span className="text-slate-500">({formatDate(user.subscription.endDate)} 만료)</span>
                      </p>
                  ) : (
                      <p className="text-slate-400 text-xs">
                          현재 무료 회원을 이용하고 있습니다.<br/>
                          PRO 기능으로 업그레이드하세요.
                      </p>
                  )}
                  <div className="mt-2 text-blue-400 text-xs font-bold flex items-center gap-1">
                      멤버십 정보 확인 <i className="fas fa-arrow-right"></i>
                  </div>
              </div>
          </div>

          {/* Side Hustle Card */}
          <div className="bg-[#14532d] p-5 rounded-xl border border-green-800 shadow-lg flex items-start gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/20 rounded-bl-full -mr-4 -mt-4"></div>
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center text-white flex-shrink-0 z-10 group-hover:scale-110 transition-transform">
                  <MoneyIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 z-10">
                  <h3 className="text-white font-bold text-lg mb-1">월 1,000 부업유튜브</h3>
                  <p className="text-green-100 text-xs opacity-90 leading-snug">
                      유튜브로 부수입을 만드는 시크릿 노하우. 지금 신청하고 전자책을 받아보세요.
                  </p>
                  <a href="#" className="mt-2 text-green-300 text-xs font-bold flex items-center gap-1 hover:text-white transition-colors">
                      신청하러 가기 <i className="fas fa-external-link-alt"></i>
                  </a>
              </div>
          </div>

          {/* Study Cafe Card */}
          <div className="bg-[#78350f] p-5 rounded-xl border border-orange-900 shadow-lg flex items-start gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/20 rounded-bl-full -mr-4 -mt-4"></div>
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center text-white flex-shrink-0 z-10 group-hover:scale-110 transition-transform">
                  <CoffeeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 z-10">
                  <h3 className="text-white font-bold text-lg mb-1">유튜브 스터디 카페</h3>
                  <p className="text-orange-100 text-xs opacity-90 leading-snug">
                      크리에이터들과 정보를 공유하고 함께 성장하는 커뮤니티에 참여하세요.
                  </p>
                  <a href="#" className="mt-2 text-orange-300 text-xs font-bold flex items-center gap-1 hover:text-white transition-colors">
                      카페 바로가기 <i className="fas fa-external-link-alt"></i>
                  </a>
              </div>
          </div>
      </div>

      {/* Large Promo Banner */}
      <div 
        onClick={onOpenPricingModal}
        className="w-full mb-10 p-6 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl text-white shadow-xl relative overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all group"
      >
          <div className="absolute top-0 right-0 bg-yellow-400 text-red-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-md z-10">
              500명 인원한정
          </div>
          <div className="absolute -right-10 -bottom-10 text-white/10 rotate-12 transform scale-150">
              <GiftIcon className="w-64 h-64" />
          </div>
          
          <div className="relative z-10">
              <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2">
                  <span className="text-3xl">🎉</span> 오픈 기념 초특가
              </h2>
              <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black">₩9,900</span>
                  <span className="text-lg font-medium opacity-90">/ 1개월</span>
              </div>
              <p className="text-yellow-200 font-bold text-sm mb-2">하루 약 330원</p>
              <p className="text-sm opacity-90 max-w-lg">
                  한달 커피 두잔값으로 AI 기능을 무제한 체험해보세요.<br/>
                  선착순 500명 한정으로 조기 마감될 수 있습니다.
              </p>
          </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => onNavigate(feature.view)}
            className="bg-[#1e293b] border border-slate-700 rounded-2xl p-6 hover:border-slate-500 hover:-translate-y-1 transition-all duration-300 shadow-lg text-left flex flex-col h-full group relative overflow-hidden"
          >
            {feature.badge && (
                <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                        {feature.badge}
                    </span>
                </div>
            )}
            
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-4 -mt-4 transition-opacity opacity-0 group-hover:opacity-100`}></div>
            
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg mb-5 ${feature.colorClass}`}>
                {feature.icon}
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h3>
            
            <p className="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">
              {feature.description}
            </p>
            
            <div className="mt-auto flex items-center text-xs font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-wider">
              바로가기 <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Support Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={onOpenGuideModal}
            className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors text-left flex items-center gap-5 group"
          >
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                  <BookOpenIcon className="w-7 h-7" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white mb-1">사용법 가이드</h3>
                  <p className="text-sm text-slate-400">기능 사용법이 궁금하신가요? 상세 가이드를 확인하세요.</p>
              </div>
          </button>

          <a 
            href="http://pf.kakao.com/_aWxfIG"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors text-left flex items-center gap-5 group"
          >
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-slate-700 transition-colors">
                  <HeadsetIcon className="w-7 h-7" />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-white mb-1">CS 고객센터</h3>
                  <p className="text-sm text-slate-400">문의사항이나 불편한 점이 있다면 언제든 연락주세요.</p>
              </div>
          </a>
      </div>

    </div>
  );
};

export default HomeView;
