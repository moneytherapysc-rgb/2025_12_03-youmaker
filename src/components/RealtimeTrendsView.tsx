
import React, { useEffect, useState } from 'react';
import { fetchGoogleTrends } from '../services/youtubeService';
import type { GoogleTrendItem } from '../types';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUpIcon } from './icons';

const RealtimeTrendsView: React.FC = () => {
  const [googleTrends, setGoogleTrends] = useState<GoogleTrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      loadGoogleTrends();
  }, []);

  const loadGoogleTrends = async () => {
      setIsLoading(true);
      setError(null);
      try {
          const data = await fetchGoogleTrends();
          setGoogleTrends(data);
      } catch (err: any) {
          setError(err.message || 'Google 트렌드 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
       <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
           <div className="flex items-center justify-between flex-wrap gap-4">
               <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <TrendingUpIcon className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                            Google 일별 인기 급상승 검색어
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">대한민국에서 현재 가장 핫한 검색어 트렌드를 실시간으로 확인하세요.</p>
               </div>
           </div>
           
            <div className="flex gap-2 mt-4">
                <button className="px-3 py-1 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200">
                    South Korea <i className="fas fa-caret-down ml-1"></i>
                </button>
                <button className="px-3 py-1 text-sm font-medium bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-700 dark:text-slate-200">
                    일별 트렌드 <i className="fas fa-caret-down ml-1"></i>
                </button>
            </div>
       </div>

       {isLoading ? (
           <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">
                    Google RSS 데이터를 불러오는 중...
                </p>
           </div>
       ) : error ? (
            <div className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-center border border-red-200 dark:border-red-900/30">
                <i className="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
                <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
                <button onClick={loadGoogleTrends} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                    다시 시도
                </button>
            </div>
       ) : (
           <div className="bg-white dark:bg-slate-800 shadow-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
               {/* Google Trends Header */}
               <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                   <div className="col-span-1 text-center"></div>
                   <div className="col-span-3">트렌드 (검색어)</div>
                   <div className="col-span-2">검색량</div>
                   <div className="col-span-2">시작일</div>
                   <div className="col-span-2">관련 검색어</div>
                   <div className="col-span-2 text-right">트렌드 그래프</div>
               </div>

               {/* Google Trend Items */}
               <div className="divide-y divide-slate-100 dark:divide-slate-700">
                   {googleTrends.map((item, index) => (
                       <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                           <div className="col-span-1 text-center">
                               <span className="text-slate-400 font-bold">{item.rank}</span>
                           </div>
                           <div className="col-span-3">
                               <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer">
                                   {item.keyword}
                               </h3>
                           </div>
                           <div className="col-span-2">
                               <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{item.searchVolume}</div>
                           </div>
                           <div className="col-span-2">
                               <div className="text-sm text-slate-700 dark:text-slate-200">{item.startedAt}</div>
                               <div className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 mt-0.5">
                                   <i className="fas fa-chart-line"></i> {item.trendStatus}
                               </div>
                           </div>
                           <div className="col-span-2">
                               <div className="flex flex-wrap gap-x-3 gap-y-1">
                                   {item.relatedQueries.map((query, qIdx) => (
                                       <span key={qIdx} className="text-xs text-slate-500 dark:text-slate-400 hover:underline cursor-pointer">
                                           {query}
                                       </span>
                                   ))}
                               </div>
                           </div>
                           <div className="col-span-2 h-10">
                               <ResponsiveContainer width="100%" height="100%">
                                   <LineChart data={item.graphData.map((val, i) => ({ i, val }))}>
                                       <Line 
                                           type="monotone" 
                                           dataKey="val" 
                                           stroke="#10b981" 
                                           strokeWidth={2} 
                                           dot={false} 
                                       />
                                   </LineChart>
                               </ResponsiveContainer>
                           </div>
                       </div>
                   ))}
               </div>
               
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-right">
                   <span className="text-xs text-slate-400">
                       * Google Trends RSS 데이터를 기반으로 제공됩니다.
                   </span>
               </div>
           </div>
       )}
    </div>
  );
};

export default RealtimeTrendsView;
