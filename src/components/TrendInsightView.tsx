
import React, { useState, useEffect } from 'react';
import { generateTrendInsightReport, initGoogleClient } from '../services/youtubeService';
import type { TrendInsightResult, TrendRankItem } from '../types';
import { CubeTransparentIcon } from './icons';

interface TrendInsightViewProps {
    embedded?: boolean;
}

const TrendInsightView: React.FC<TrendInsightViewProps> = ({ embedded = false }) => {
    const [data, setData] = useState<TrendInsightResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const today = new Date();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await initGoogleClient();
            const result = await generateTrendInsightReport();
            setData(result);
        } catch (err: any) {
            setError(err.message || '트렌드 데이터를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        if (status === 'new') return <span className="text-[10px] font-bold text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded ml-2">NEW</span>;
        if (status === 'up') return <span className="text-[10px] font-bold text-red-600 ml-2">▲</span>;
        if (status === 'down') return <span className="text-[10px] font-bold text-blue-600 ml-2">▼</span>;
        return <span className="text-[10px] font-bold text-slate-400 ml-2">-</span>;
    };

    const RankList = ({ title, iconClass, items }: { title: string, iconClass: string, items: TrendRankItem[] }) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-700/30">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${iconClass}`}>
                    {title.includes('네이버') ? 'N' : 'G'}
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                        <div className="flex items-center gap-4">
                            <span className={`text-lg font-bold w-6 text-center ${index < 3 ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>
                                {item.rank}
                            </span>
                            <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">
                                {item.keyword}
                            </span>
                        </div>
                        <div className="flex items-center">
                            {item.searchVolume && (
                                <span className="text-xs text-slate-400 mr-2 hidden sm:inline-block">검색량 {item.searchVolume}</span>
                            )}
                            <StatusBadge status={item.status} />
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">데이터가 없습니다.</div>
                )}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center ${embedded ? 'h-64' : 'h-96'} bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">AI가 실시간 트렌드를 분석 중입니다...</p>
                <p className="text-sm text-slate-400">네이버, 구글 데이터를 수집하고 있습니다.</p>
            </div>
        );
    }

    return (
        <div className={`${embedded ? 'w-full' : 'max-w-6xl mx-auto pb-12'} space-y-8 animate-fade-in-up font-sans`}>
            {/* Header */}
            <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-4">
                    <CubeTransparentIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">실시간 트렌드 리포트</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    선택된 일자 및 시간대의 실시간 검색어
                </p>
                <p className="text-sm text-slate-400 mt-1">
                    {today.getFullYear()}년 {today.getMonth() + 1}월 {today.getDate()}일 {today.getHours()}시 기준
                </p>
            </div>

            {error ? (
                 <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/30">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full inline-block mb-4">
                        <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">데이터 로드 실패</h2>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button onClick={loadData} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        다시 시도
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Naver Section - Green Theme */}
                    <RankList 
                        title="네이버 실시간 이슈" 
                        iconClass="bg-[#03C75A]" 
                        items={data?.naver || []} 
                    />

                    {/* Google Section - Blue/Google Colors */}
                    <RankList 
                        title="구글 트렌드 (대한민국)" 
                        iconClass="bg-blue-500"
                        items={data?.google || []} 
                    />
                </div>
            )}
            
            <div className="text-right text-xs text-slate-400 mt-4">
                * 본 리포트는 Google Trends 및 검색 도구를 통해 수집된 데이터를 AI가 재구성한 결과입니다. 실제 순위와 다소 차이가 있을 수 있습니다.
            </div>
        </div>
    );
};

export default TrendInsightView;
