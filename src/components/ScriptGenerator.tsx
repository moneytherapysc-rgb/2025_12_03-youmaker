import React, { useState } from 'react';
import {
    cleanTranscript,
    summarizeTranscriptForCreation,
    recreateScriptFromSummary,
    generateTitlesFromScript,
    generateThumbnailTextFromTitles,
} from '../services/youtubeService';
import type { GeneratedScript, SummaryObject, GeneratedTitles, GeneratedThumbnailText } from '../types';
import { SparklesIcon, CheckCircleIcon, CopyIcon } from './icons';

const MASTER_INSTRUCTION = `
🧠 GPT의 역할 및 정체성
당신은 1억 명의 구독자를 보유한 유튜브 전문가이자 마케팅 전략가입니다.
유튜브 알고리즘에 대한 깊은 이해를 바탕으로, 시청 지속 시간을 극대화하고 클릭률(CTR)을 높이는 콘텐츠를 기획합니다.
문맥이 자연스럽고 몰입감 있는 대본을 작성하는 데 탁월한 능력이 있습니다.
`;

const ScriptGenerator: React.FC = () => {
    // Input
    const [originalScript, setOriginalScript] = useState('');

    // Process State
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0); // 0: idle, 1..5: processing step
    const [error, setError] = useState<string | null>(null);

    // Results
    const [cleanedScript, setCleanedScript] = useState<string | null>(null);
    const [summary, setSummary] = useState<SummaryObject | null>(null);
    const [newScript, setNewScript] = useState<GeneratedScript | null>(null);
    const [titles, setTitles] = useState<GeneratedTitles | null>(null);
    const [thumbnailTexts, setThumbnailTexts] = useState<GeneratedThumbnailText | null>(null);

    const resetState = () => {
        setIsProcessing(false);
        setCurrentStepIndex(0);
        setError(null);
        setCleanedScript(null);
        setSummary(null);
        setNewScript(null);
        setTitles(null);
        setThumbnailTexts(null);
    };

    const handleStart = async () => {
        if (!originalScript.trim()) {
            setError('분석할 원본 스크립트를 입력해주세요.');
            return;
        }

        resetState();
        setIsProcessing(true);
        setError(null);

        try {
            // Step 1: Clean
            setCurrentStepIndex(1);
            const cleaned = await cleanTranscript(originalScript, MASTER_INSTRUCTION);
            if (!cleaned) throw new Error("대본 정리에 실패했습니다.");
            setCleanedScript(cleaned);

            // Step 2: Summarize
            setCurrentStepIndex(2);
            const summaryRes = await summarizeTranscriptForCreation(cleaned, MASTER_INSTRUCTION);
            if (!summaryRes || !summaryRes.coreMessage) throw new Error("내용 요약에 실패했습니다. (응답 오류)");
            setSummary(summaryRes);

            // Step 3: Recreate
            setCurrentStepIndex(3);
            const rewriteRes = await recreateScriptFromSummary(summaryRes, {}, MASTER_INSTRUCTION);
            if (!rewriteRes || !rewriteRes.script) throw new Error("대본 재창조에 실패했습니다. (응답 오류)");
            setNewScript(rewriteRes);

            // Step 4: Titles
            setCurrentStepIndex(4);
            const titleRes = await generateTitlesFromScript(rewriteRes, MASTER_INSTRUCTION);
            if (!titleRes || !titleRes.fresh) throw new Error("제목 생성에 실패했습니다.");
            setTitles(titleRes);

            // Step 5: Thumbnails
            setCurrentStepIndex(5);
            const thumbRes = await generateThumbnailTextFromTitles(titleRes, MASTER_INSTRUCTION);
            if (!thumbRes || !thumbRes.visual) throw new Error("썸네일 문구 생성에 실패했습니다.");
            setThumbnailTexts(thumbRes);

            setCurrentStepIndex(6); // Complete
        } catch (err: any) {
            console.error(err);
            setError(err.message || '작업 중 알 수 없는 오류가 발생했습니다.');
            setIsProcessing(false);
        } finally {
            if (currentStepIndex === 6) setIsProcessing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('복사되었습니다.');
    };

    const ResultCard: React.FC<{ 
        stepNumber: number; 
        title: string; 
        children: React.ReactNode; 
        isReady: boolean;
        isLoading: boolean;
    }> = ({ stepNumber, title, children, isReady, isLoading }) => {
        if (!isReady && !isLoading) return null;

        return (
            <div className={`p-6 rounded-xl border transition-all duration-500 mb-6 ${
                isReady 
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg' 
                : 'bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700 opacity-70'
            }`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isReady ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-slate-200 text-slate-500'
                    }`}>
                        {stepNumber}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                    {isLoading && (
                        <div className="ml-auto flex items-center gap-2 text-red-500 text-sm font-semibold animate-pulse">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            AI 작업 중...
                        </div>
                    )}
                    {isReady && <CheckCircleIcon className="w-6 h-6 text-green-500 ml-auto" />}
                </div>
                
                {isReady ? (
                    <div className="animate-fade-in-up">
                        {children}
                    </div>
                ) : (
                    <div className="h-12 flex items-center justify-center text-slate-400 text-sm">
                        대기 중...
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 font-sans pb-20">
            {/* Header & Input */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-t-4 border-red-600">
                <h2 className="text-3xl font-extrabold text-center text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
                    AI 스크립트 벤치마킹 <span className="text-red-600">One-Pass</span>
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm align-middle">PRO</span>
                </h2>
                <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
                    원본 대본만 넣으세요. 정리부터 재창조, 썸네일 기획까지 한 번에 끝내드립니다.
                </p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="original-script" className="block text-md font-bold text-slate-700 dark:text-slate-300 mb-2">
                            원본 스크립트 (전체 대본)
                        </label>
                        <textarea 
                            id="original-script" 
                            value={originalScript} 
                            onChange={(e) => setOriginalScript(e.target.value)}
                            placeholder="벤치마킹할 영상의 전체 대본을 여기에 붙여넣으세요..." 
                            rows={10}
                            className="w-full px-4 py-3 text-base bg-slate-50 dark:bg-slate-700 dark:text-slate-100 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-y leading-relaxed"
                            disabled={isProcessing && currentStepIndex < 6}
                        />
                    </div>

                    <button 
                        onClick={handleStart}
                        className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-xl hover:from-red-700 hover:to-pink-700 transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={isProcessing && currentStepIndex < 6}
                    >
                        {isProcessing && currentStepIndex < 6 ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>AI가 5단계 분석을 진행 중입니다...</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <SparklesIcon className="w-5 h-5" />
                                <span>원클릭 분석 및 재창조 시작</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-300 text-center animate-fade-in-up">
                    <p className="font-bold mb-1">오류 발생</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Results Stream */}
            <div className="space-y-4">
                {/* Step 1 */}
                <ResultCard 
                    stepNumber={1} 
                    title="원본 대본 정리 및 교정" 
                    isReady={!!cleanedScript} 
                    isLoading={currentStepIndex === 1}
                >
                    <div className="relative bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                            {cleanedScript}
                        </pre>
                        <button onClick={() => copyToClipboard(cleanedScript || '')} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-blue-500 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 transition-colors">
                            <CopyIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </ResultCard>

                {/* Step 2 */}
                <ResultCard 
                    stepNumber={2} 
                    title="핵심 내용 요약" 
                    isReady={!!summary} 
                    isLoading={currentStepIndex === 2}
                >
                    {summary && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">💡 핵심 메시지</h4>
                                <p className="text-slate-700 dark:text-slate-200">{summary.coreMessage}</p>
                            </div>
                            <div className="pl-4 border-l-4 border-slate-200 dark:border-slate-600">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">구조 분석</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{summary.structure}</p>
                                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                                    {summary.summaryPoints?.map((p, i) => <li key={i}>{p}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </ResultCard>

                {/* Step 3 */}
                <ResultCard 
                    stepNumber={3} 
                    title="새로운 대본 재창조" 
                    isReady={!!newScript} 
                    isLoading={currentStepIndex === 3}
                >
                    {newScript && (
                        <div className="space-y-4 relative">
                            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 mb-4">
                                <h4 className="text-xl font-extrabold text-indigo-900 dark:text-indigo-100">{newScript.title}</h4>
                                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">{newScript.description}</p>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                                <div className="mb-4">
                                    <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded mb-2">Opening</span>
                                    <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-medium">{newScript.script?.opening?.narration}</p>
                                    <p className="text-xs text-slate-500 mt-1 italic">Visual: {newScript.script?.opening?.visual_cue}</p>
                                </div>
                                <div className="space-y-4">
                                    {newScript.script?.main_points?.map((point, i) => (
                                        <div key={i} className="pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                                            <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded mb-2">{point.scene}</span>
                                            <p className="text-slate-800 dark:text-slate-100 leading-relaxed">{point.narration}</p>
                                            <p className="text-xs text-slate-500 mt-1 italic">Visual: {point.visual_cue}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-600">
                                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded mb-2">Closing</span>
                                    <p className="text-slate-800 dark:text-slate-100 leading-relaxed font-medium">{newScript.script?.closing?.narration}</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    const fullText = `[제목] ${newScript.title}\n\n[오프닝]\n${newScript.script?.opening?.narration}\n\n[본문]\n${newScript.script?.main_points?.map(p => p.narration).join('\n\n')}\n\n[클로징]\n${newScript.script?.closing?.narration}`;
                                    copyToClipboard(fullText);
                                }} 
                                className="absolute top-0 right-0 p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                title="전체 대본 복사"
                            >
                                <CopyIcon />
                            </button>
                        </div>
                    )}
                </ResultCard>

                {/* Step 4 */}
                <ResultCard 
                    stepNumber={4} 
                    title="클릭 유도형 제목 생성" 
                    isReady={!!titles} 
                    isLoading={currentStepIndex === 4}
                >
                    {titles && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-600 pb-2">✨ 신선한 버전</h4>
                                <ul className="space-y-2">
                                    {titles.fresh?.map((t, i) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                            <span className="text-indigo-500 font-bold">{i+1}.</span> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-600 pb-2">🛡️ 안정적 버전 (검증된 형식)</h4>
                                <ul className="space-y-2">
                                    {titles.stable?.map((t, i) => (
                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                            <span className="text-green-500 font-bold">{i+1}.</span> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </ResultCard>

                {/* Step 5 */}
                <ResultCard 
                    stepNumber={5} 
                    title="썸네일 문구 제작" 
                    isReady={!!thumbnailTexts} 
                    isLoading={currentStepIndex === 5}
                >
                    {thumbnailTexts && (
                        <div className="grid md:grid-cols-3 gap-4">
                            {[
                                { title: '감정 자극형', items: thumbnailTexts.emotional, color: 'text-pink-500' },
                                { title: '정보 전달형', items: thumbnailTexts.informational, color: 'text-blue-500' },
                                { title: '시각 대비형', items: thumbnailTexts.visual, color: 'text-orange-500' }
                            ].map((section, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                                    <h4 className={`font-bold ${section.color} mb-3 border-b border-slate-200 dark:border-slate-600 pb-2`}>{section.title}</h4>
                                    <ul className="space-y-2">
                                        {section.items?.map((t, i) => (
                                            <li key={i} className="text-sm text-slate-700 dark:text-slate-200 font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
                                                {t}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </ResultCard>
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

export default ScriptGenerator;