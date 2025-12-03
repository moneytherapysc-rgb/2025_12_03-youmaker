import React, { useState } from 'react';
import { generateShortsScript } from '../services/youtubeService';
import type { GeneratedShortsScript } from '../types';
import { LightningIcon, CopyIcon, SparklesIcon, CheckCircleIcon } from './icons';

const GENRES = ['기본', '시니어건강', '국뽕', '해외반응', '스토리형', '시니어감성', '쇼핑전환형'];

const ShortsGeneratorView: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('기본');
    const [isLoading, setIsLoading] = useState(false);
    const [scriptResults, setScriptResults] = useState<GeneratedShortsScript[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsLoading(true);
        setError(null);
        setScriptResults([]);

        try {
            const results = await generateShortsScript(keyword.trim(), selectedGenre);
            if (Array.isArray(results) && results.length > 0) {
                setScriptResults(results);
            } else {
                throw new Error('대본 생성 결과가 올바르지 않습니다. 잠시 후 다시 시도해주세요.');
            }
        } catch (err: any) {
            setError(err.message || '대본 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('복사되었습니다.');
    };

    return (
        <div className="max-w-5xl mx-auto font-sans animate-fade-in-up pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 text-center border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-red-500"></div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 mb-4">
                    <LightningIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                    쇼츠 대본 생성기
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm align-middle">PRO</span>
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    키워드만 입력하면 3초 훅이 포함된 조회수 폭발 쇼츠 대본 5개를 즉시 생성합니다.
                </p>
            </div>

            {/* Controls */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8">
                <form onSubmit={handleGenerate} className="space-y-6">
                    {/* Genre Toggles */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 ml-1">
                            대본 스타일 (장르) 선택
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GENRES.map(genre => (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => setSelectedGenre(genre)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                                        selectedGenre === genre
                                        ? 'bg-yellow-500 text-white border-yellow-500 shadow-md transform scale-105'
                                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Keyword Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="주제 키워드를 입력하세요 (예: 편의점 꿀조합, 아이폰 꿀팁)"
                            className="w-full pl-6 pr-32 py-4 text-lg bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 dark:text-white shadow-sm transition-all placeholder:text-slate-400"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !keyword.trim()}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 생성 중</>
                            ) : (
                                <><SparklesIcon className="w-4 h-4" /> 대본 생성</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-6 border border-red-200 dark:border-red-800 animate-fade-in-up">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                </div>
            )}

            {/* Results Display */}
            {scriptResults.length > 0 && (
                <div className="space-y-8">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-2">
                            <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            5개의 맞춤형 대본이 생성되었습니다
                        </h3>
                    </div>

                    {scriptResults.map((script, index) => {
                        if (!script) return null;
                        return (
                            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                                {/* Script Header */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex justify-between items-center text-white">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-yellow-500 text-slate-900 font-black text-lg w-10 h-10 flex items-center justify-center rounded-lg shadow-md shrink-0">
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <span className="inline-block bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1">OPTION {index + 1}</span>
                                            <h3 className="text-xl font-bold leading-tight">{script.title || '제목 없음'}</h3>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(`제목: ${script.title}\n\n[HOOK]\n${script.hook}\n\n[BODY]\n${script.body}\n\n[ENDING]\n${script.ending}`)}
                                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                                        title="전체 복사"
                                    >
                                        <CopyIcon className="w-5 h-5 text-white" />
                                    </button>
                                </div>

                                <div className="p-6 md:p-8 space-y-6">
                                    {/* HOOK Section */}
                                    <div className="relative pl-6 border-l-4 border-red-500">
                                        <h4 className="text-red-600 dark:text-red-400 font-extrabold text-sm uppercase tracking-wider mb-2">
                                            HOOK (3초 후킹)
                                        </h4>
                                        <p className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                                            {script.hook || '생성 실패'}
                                        </p>
                                    </div>

                                    {/* BODY Section */}
                                    <div className="relative pl-6 border-l-4 border-slate-300 dark:border-slate-600">
                                        <h4 className="text-slate-500 dark:text-slate-400 font-extrabold text-sm uppercase tracking-wider mb-2">
                                            BODY (본문)
                                        </h4>
                                        <div className="text-slate-700 dark:text-slate-200 leading-loose whitespace-pre-wrap text-base">
                                            {script.body || '내용 없음'}
                                        </div>
                                    </div>

                                    {/* ENDING Section */}
                                    <div className="relative pl-6 border-l-4 border-indigo-500">
                                        <h4 className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm uppercase tracking-wider mb-2">
                                            ENDING (결말 & 유도)
                                        </h4>
                                        <p className="text-base font-medium text-slate-800 dark:text-slate-100 leading-relaxed bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                                            {script.ending || '내용 없음'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
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

export default ShortsGeneratorView;