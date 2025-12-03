
import React from 'react';
import type { KeywordAnalysisResult } from '../types';

interface KeywordTrendOverviewProps {
  data: KeywordAnalysisResult;
}

const KeywordTrendOverview: React.FC<KeywordTrendOverviewProps> = ({ data }) => {
  const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR').format(num);

  return (
    <div className="w-full mb-6 animate-fade-in-up font-sans">
      
      {/* Related Keywords Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-5 mb-6 shadow-sm rounded-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">관련키워드</span>
            <button className="px-2 py-0.5 text-xs font-bold text-[#27ae60] border border-[#27ae60] bg-white dark:bg-slate-700 dark:text-[#2ecc71] dark:border-[#2ecc71] rounded-sm cursor-pointer hover:bg-green-50 dark:hover:bg-slate-600 transition-colors">
                태그 자동생성
            </button>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 leading-relaxed">
            {data.relatedKeywords?.map((keyword, index) => (
                <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    key={index} 
                    className="text-sm text-[#2980b9] hover:underline hover:text-blue-800 dark:text-[#3498db] cursor-pointer font-medium tracking-tight"
                >
                    {keyword}
                </a>
            ))}
        </div>
      </div>

      {/* Volume Table Section */}
      <div className="overflow-x-auto border-t border-x border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm rounded-sm">
        <table className="w-full text-sm text-left border-collapse border-b border-slate-300 dark:border-slate-600">
            <thead className="text-xs text-white uppercase bg-[#2f3542] dark:bg-slate-900">
                <tr>
                    <th scope="col" className="px-4 py-3 w-10 text-center border-r border-slate-500/50">
                         <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-500 bg-slate-700 cursor-pointer" disabled />
                    </th>
                    <th scope="col" className="px-6 py-3 font-bold border-r border-slate-500/50 text-center">키워드</th>
                    <th scope="col" className="px-6 py-3 font-bold border-r border-slate-500/50 text-center">PC 검색량</th>
                    <th scope="col" className="px-6 py-3 font-bold border-r border-slate-500/50 text-center">모바일 검색량</th>
                    <th scope="col" className="px-6 py-3 font-bold text-center">총조회수</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {data.volumes?.map((vol, index) => (
                    <tr key={index} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-slate-700 dark:text-slate-200">
                        <td className="px-4 py-3 text-center border-r border-slate-200 dark:border-slate-700">
                            <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer" />
                        </td>
                        <td className="px-6 py-3 font-medium text-[#2980b9] dark:text-[#3498db] whitespace-nowrap border-r border-slate-200 dark:border-slate-700 hover:underline cursor-pointer text-left">
                            {vol.keyword}
                        </td>
                        <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-700 text-right font-mono tracking-tight">
                            {formatNumber(vol.pcVolume)}
                        </td>
                        <td className="px-6 py-3 border-r border-slate-200 dark:border-slate-700 text-right font-mono tracking-tight">
                            {formatNumber(vol.mobileVolume)}
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-900 dark:text-slate-100 text-right font-mono tracking-tight">
                            {formatNumber(vol.totalVolume)}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
      <div className="text-right mt-2 mb-8">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">* 검색량은 AI 기반 추정치이며 실제 데이터와 차이가 있을 수 있습니다.</span>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default KeywordTrendOverview;
