
import React, { useState } from 'react';
import { compareChannels, initGoogleClient } from '../services/youtubeService';
import type { ChannelBattleResult } from '../types';
import { SwordsIcon, SearchIcon, ChartBarIcon } from './icons';
import { ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

const ChannelBattleView: React.FC = () => {
    const [queryA, setQueryA] = useState('');
    const [queryB, setQueryB] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ChannelBattleResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleBattle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!queryA.trim() || !queryB.trim()) {
            setError('두 채널의 이름이나 ID를 모두 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Ensure Google Client is ready before making API calls
            await initGoogleClient();
            
            const data = await compareChannels(queryA.trim(), queryB.trim());
            setResult(data);
        } catch (err: any) {
            setError(err.message || '비교 분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

    const StatRow: React.FC<{ label: string; valA: string | number; valB: string | number; unit?: string }> = ({ label, valA, valB, unit = '' }) => (
        <div className="grid grid-cols-3 py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div className="text-right font-bold text-slate-700 dark:text-slate-300">{valA}{unit}</div>
            <div className="text-center text-slate-400 text-sm">{label}</div>
            <div className="text-left font-bold text-slate-700 dark:text-slate-300">{valB}{unit}</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto font-sans animate-fade-in-up pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 text-center border border-slate-200 dark:border-slate-700">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                    <SwordsIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                    채널 1:1 전투력 비교
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm align-middle">PRO</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    두 채널의 데이터를 분석하여 승자를 가리고 전략적 차이를 비교합니다.
                </p>
            </div>

            {/* Search Area */}
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg mb-8 border border-slate-200 dark:border-slate-700">
                <form onSubmit={handleBattle} className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 ml-1">BLUE TEAM (도전자 A)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={queryA}
                                onChange={(e) => setQueryA(e.target.value)}
                                placeholder="채널 A 이름 또는 ID"
                                className="w-full pl-10 pr-4 py-3 bg-blue-50 dark:bg-slate-700/50 border-2 border-blue-100 dark:border-slate-600 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <div className="absolute left-3 top-3.5 text-blue-400">
                                <SearchIcon />
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0 z-10 -my-2 md:my-0">
                        <div className="w-12 h-12 bg-slate-800 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-black italic text-lg shadow-lg border-4 border-white dark:border-slate-800">
                            VS
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-red-600 dark:text-red-400 mb-2 ml-1">RED TEAM (도전자 B)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={queryB}
                                onChange={(e) => setQueryB(e.target.value)}
                                placeholder="채널 B 이름 또는 ID"
                                className="w-full pl-10 pr-4 py-3 bg-red-50 dark:bg-slate-700/50 border-2 border-red-100 dark:border-slate-600 rounded-xl focus:outline-none focus:border-red-500 transition-colors"
                            />
                            <div className="absolute left-3 top-3.5 text-red-400">
                                <SearchIcon />
                            </div>
                        </div>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <button
                        onClick={handleBattle}
                        disabled={isLoading || !queryA.trim() || !queryB.trim()}
                        className="px-10 py-3 bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 hover:from-slate-800 hover:to-black text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? '데이터 분석 중...' : '전투 시작!'}
                    </button>
                </div>
                {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center text-sm font-medium">
                        <i className="fas fa-exclamation-circle mr-2"></i> {error}
                    </div>
                )}
            </div>

            {result && (
                <div className="animate-fade-in-up space-y-8">
                    {/* Winner Banner */}
                    <div className="relative bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-8 text-center text-white shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-indigo-200 mb-4 tracking-widest uppercase">Winner</h3>
                            <div className="flex items-center justify-center gap-6">
                                <div className={`text-4xl md:text-5xl font-black ${result.winner === 'A' ? 'text-blue-400' : result.winner === 'B' ? 'text-red-400' : 'text-gray-300'}`}>
                                    {result.winner === 'A' ? result.channelA.title : result.winner === 'B' ? result.channelB.title : '무승부'}
                                </div>
                                {result.winner !== 'Tie' && <i className="fas fa-trophy text-yellow-400 text-4xl md:text-5xl animate-bounce"></i>}
                            </div>
                            <p className="mt-4 text-indigo-100 opacity-80">
                                종합 전투력 점수: <span className="font-bold text-white">{result.winner === 'A' ? result.statsA?.powerScore : result.statsB?.powerScore}</span> vs {result.winner === 'A' ? result.statsB?.powerScore : result.statsA?.powerScore}
                            </p>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Radar Chart */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">능력치 비교</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={result.radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                        <Radar name={result.channelA.title} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        <Radar name={result.channelB.title} dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                                        <Legend />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} itemStyle={{ color: '#f8fafc' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Detailed Stats Comparison */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col">
                            <div className="flex justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="text-center w-1/3">
                                    <img src={result.channelA.thumbnailUrl} alt="A" className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-blue-500" />
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">{result.channelA.title}</p>
                                </div>
                                <div className="text-center w-1/3 flex items-center justify-center">
                                    <span className="font-bold text-slate-400 italic">VS</span>
                                </div>
                                <div className="text-center w-1/3">
                                    <img src={result.channelB.thumbnailUrl} alt="B" className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-red-500" />
                                    <p className="text-xs font-bold text-red-600 dark:text-red-400 truncate">{result.channelB.title}</p>
                                </div>
                            </div>

                            <div className="flex-grow flex flex-col justify-center space-y-1">
                                <StatRow label="구독자" valA={formatNumber(result.statsA?.subscribers || 0)} valB={formatNumber(result.statsB?.subscribers || 0)} />
                                <StatRow label="총 조회수" valA={formatNumber(result.statsA?.totalViews || 0)} valB={formatNumber(result.statsB?.totalViews || 0)} />
                                <StatRow label="평균 조회수" valA={formatNumber(result.statsA?.avgViews || 0)} valB={formatNumber(result.statsB?.avgViews || 0)} />
                                <StatRow label="참여율" valA={result.statsA?.engagementRate || 0} valB={result.statsB?.engagementRate || 0} unit="%" />
                                <StatRow label="월 업로드" valA={result.statsA?.uploadFrequency || 0} valB={result.statsB?.uploadFrequency || 0} unit="개" />
                                <StatRow label="총 영상" valA={result.statsA?.videoCount || 0} valB={result.statsB?.videoCount || 0} unit="개" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ChannelBattleView;
