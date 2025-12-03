
import React, { useState } from 'react';
import { getVideoComments, analyzeCommentSentiment, initGoogleClient } from '../services/youtubeService';
import type { CommentAnalysisResult } from '../types';
import { ChatBubbleIcon, CheckCircleIcon } from './icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CommentAnalysisView: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<CommentAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const extractVideoId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!videoUrl.trim()) return;

        const videoId = extractVideoId(videoUrl);
        if (!videoId) {
            setError('올바른 유튜브 영상 링크가 아닙니다.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            await initGoogleClient();
            
            // Limit to 50 comments as requested to prevent lag and ensure robustness
            const comments = await getVideoComments(videoId, 50);
            if (comments.length === 0) {
                throw new Error('분석할 댓글이 없거나, 댓글 사용이 중지된 영상입니다.');
            }
            
            const analysis = await analyzeCommentSentiment(comments);
            setResult(analysis);
        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || '분석 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const SentimentChart: React.FC<{ sentiment: CommentAnalysisResult['sentiment'] }> = ({ sentiment }) => {
        const data = [
            { name: '긍정', value: sentiment.positive, color: '#10b981' },
            { name: '중립', value: sentiment.neutral, color: '#9ca3af' },
            { name: '부정', value: sentiment.negative, color: '#ef4444' },
        ];

        return (
            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value}%`} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{sentiment.positive}%</span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">긍정 비율</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto font-sans animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                        <ChatBubbleIcon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                        댓글 민심 분석
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm align-middle">PRO</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        실제 댓글 50개를 분석하여 긍/부정 비율과 핵심 여론을 5줄 요약으로 제공합니다.
                    </p>
                </div>

                <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto flex shadow-md rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
                    <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="분석할 유튜브 영상 링크를 입력하세요 (https://...)"
                        className="flex-grow px-6 py-4 text-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 outline-none"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !videoUrl.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-bold text-lg transition-colors disabled:bg-slate-400 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            '분석'
                        )}
                    </button>
                </form>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-center mb-6">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}

            {result && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Top Summary & Sentiment */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">감정 분석 결과</h3>
                            <SentimentChart sentiment={result.sentiment} />
                            <div className="flex justify-center gap-4 mt-4 text-sm font-medium">
                                <span className="text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>긍정</span>
                                <span className="text-slate-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400"></span>중립</span>
                                <span className="text-red-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>부정</span>
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 flex flex-col gap-6">
                             <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">베스트 키워드</h3>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywords?.map((keyword, i) => (
                                        <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                            i < 3 
                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-base'
                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
                                        }`}>
                                            #{keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 flex-grow">
                                <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-3">AI 5줄 요약 (총평)</h3>
                                <div className="text-base font-medium text-slate-800 dark:text-slate-100 leading-loose whitespace-pre-wrap">
                                    {result.summary.oneLine}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pros & Cons */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-t-4 border-t-green-500 border-x border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                                <i className="fas fa-thumbs-up"></i> 시청자들이 좋아하는 점
                            </h3>
                            <ul className="space-y-3">
                                {result.summary.pros?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5"/>
                                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border-t-4 border-t-red-500 border-x border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <i className="fas fa-thumbs-down"></i> 아쉬워하는 점 (피드백)
                            </h3>
                            <ul className="space-y-3">
                                {result.summary.cons?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                                        <i className="fas fa-exclamation-circle w-5 h-5 text-red-500 flex-shrink-0 mt-1"></i>
                                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
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

export default CommentAnalysisView;
