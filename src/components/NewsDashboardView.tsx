import React, { useState, useEffect } from 'react';
import { fetchNews } from '../services/youtubeService';
import type { NewsItem } from '../types';
import { RocketIcon, CheckCircleIcon } from './icons';

const categories = [
    { id: 'General', label: '종합' },
    { id: 'Politics', label: '정치' },
    { id: 'Economy', label: '경제' },
    { id: 'Society', label: '사회' },
    { id: 'IT/Science', label: 'IT/과학' },
    { id: 'Entertainment', label: '연예' }
];

const NewsDashboardView: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('General');
    const [news, setNews] = useState<NewsItem[]>([]);
    const [referenceDate, setReferenceDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadNews(selectedCategory);
    }, [selectedCategory]);

    const loadNews = async (category: string) => {
        setIsLoading(true);
        setNews([]); // Clear previous news while loading
        setReferenceDate('');
        try {
            const { items, referenceDate } = await fetchNews(category);
            setNews(items);
            setReferenceDate(referenceDate);
        } catch (err) {
            console.error("News Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto font-sans animate-fade-in-up pb-12 h-full flex flex-col">
            {/* Header */}
            <div className="bg-[#1e293b] p-6 rounded-2xl shadow-lg mb-6 border border-slate-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                            <RocketIcon className="w-6 h-6 text-green-500" />
                            실시간 뉴스 트렌드 (네이버 뉴스)
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm align-middle">PRO</span>
                        </h2>
                        <p className="text-slate-400 text-sm">
                            주요 네이버 뉴스를 한눈에 확인하세요.
                        </p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                            {news.length > 0 ? '업데이트 완료' : '데이터 대기 중'}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{new Date().toLocaleString()}</p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                                selectedCategory === cat.id
                                    ? 'bg-white text-slate-900 border-white shadow-md transform scale-105'
                                    : 'bg-[#0f172a] text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* News Grid */}
            <div className="flex flex-col h-full bg-[#1e293b] rounded-2xl shadow-lg border border-slate-700 overflow-hidden min-h-[600px]">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-[#03C75A]/10">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#03C75A]"></span>
                        <h3 className="font-bold text-white text-lg">
                            네이버 뉴스 ({referenceDate || '실시간 집계 중...'})
                        </h3>
                    </div>
                    {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white"></div>}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500 mb-4"></div>
                            <p className="text-sm font-bold text-white">AI가 실시간 뉴스를 분석하고 있습니다...</p>
                            <p className="text-xs text-slate-500 mt-1">네이버 뉴스 Top 30 수집 중</p>
                        </div>
                    ) : news.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                            <p className="mb-2">뉴스 데이터를 불러오지 못했습니다.</p>
                            <button 
                                onClick={() => loadNews(selectedCategory)}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                                다시 시도
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:gap-px bg-slate-700">
                            {news.map((item) => (
                                <div key={item.rank} className="bg-[#1e293b] p-4 hover:bg-slate-800/50 transition-colors group flex items-start gap-4">
                                    <span className={`text-lg font-bold w-8 text-center shrink-0 ${item.rank <= 3 ? 'text-yellow-500' : 'text-slate-500'}`}>
                                        {item.rank}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <a href={item.url || `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(item.title)}`} target="_blank" rel="noopener noreferrer" className="block">
                                            <h4 className="text-slate-200 font-bold text-sm leading-snug group-hover:text-green-400 transition-colors line-clamp-2 mb-2">
                                                {item.title}
                                            </h4>
                                        </a>
                                        <div className="flex items-center text-xs text-slate-500 gap-2">
                                            <span className="text-slate-400 font-medium">{item.press}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1e293b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #475569;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #64748b;
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

export default NewsDashboardView;
