
import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, base64ToUint8Array, pcmToWav } from '../services/youtubeService';
import { MicrophoneIcon, SpeakerWaveIcon, StopIcon, DownloadIcon, InformationCircleIcon, CheckCircleIcon } from './icons';

// 10 diverse voice presets mapped to Gemini's available voices
const voicePresets = [
    { id: 'preset_1', voiceName: 'Kore', label: '차분한 뉴스톤 (민지)', gender: 'Female', tag: '뉴스/정보', description: '정확하고 신뢰감 있는 정보 전달' },
    { id: 'preset_2', voiceName: 'Puck', label: '장난꾸러기 (준호)', gender: 'Male', tag: '예능/브이로그', description: '톡톡 튀고 활기찬 분위기' },
    { id: 'preset_3', voiceName: 'Zephyr', label: '부드러운 힐링 (수진)', gender: 'Female', tag: '감성/에세이', description: '따뜻하고 위로가 되는 목소리' },
    { id: 'preset_4', voiceName: 'Charon', label: '중후한 다큐 (성진)', gender: 'Male', tag: '다큐/리뷰', description: '깊이 있고 무게감 있는 톤' },
    { id: 'preset_5', voiceName: 'Fenrir', label: '강력한 텐션 (철수)', gender: 'Male', tag: '쇼츠/광고', description: '귀에 꽂히는 강한 임팩트' },
    { id: 'preset_6', voiceName: 'Kore', label: '친절한 선생님 (지수)', gender: 'Female', tag: '교육/설명', description: '차분하고 또박또박한 설명' },
    { id: 'preset_7', voiceName: 'Puck', label: '열혈 게임캐스터 (민석)', gender: 'Male', tag: '게임/중계', description: '높은 톤의 빠른 진행' },
    { id: 'preset_8', voiceName: 'Zephyr', label: '나긋나긋 상담원 (유리)', gender: 'Female', tag: '안내/ASMR', description: '상냥하고 친절한 응대' },
    { id: 'preset_9', voiceName: 'Charon', label: '미스터리 공포 (그림자)', gender: 'Male', tag: '공포/썰', description: '낮고 서늘한 스토리텔링' },
    { id: 'preset_10', voiceName: 'Fenrir', label: '동기부여 연설 (태양)', gender: 'Male', tag: '자기계발', description: '단호하고 힘찬 설득력' },
];

const VoiceStudioView: React.FC = () => {
    const [text, setText] = useState('');
    const [selectedPresetId, setSelectedPresetId] = useState('preset_1');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const MAX_CHARS = 300;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (val.length <= MAX_CHARS) {
            setText(val);
        }
    };

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            const preset = voicePresets.find(p => p.id === selectedPresetId);
            if (!preset) throw new Error("보이스를 선택해주세요.");

            const base64 = await generateSpeech(text, preset.voiceName);
            const pcmData = base64ToUint8Array(base64);
            const wavBlob = pcmToWav(pcmData);
            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
        } catch (err: any) {
            setError(err.message || '오디오 생성 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedPreset = voicePresets.find(p => p.id === selectedPresetId);

    return (
        <div className="max-w-6xl mx-auto font-sans animate-fade-in-up pb-12">
            {/* Header */}
            <div className="text-center mb-10 pt-8">
                <div className="inline-block px-4 py-1.5 rounded-full bg-teal-900/50 border border-teal-500/30 text-teal-300 text-xs font-bold mb-4">
                    Powered by Gemini 2.5 Flash TTS
                </div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    AI 보이스 스튜디오
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-6">
                    대본만 입력하면 전문 성우 퀄리티의 AI 내레이션이 완성됩니다.
                </p>
                
                {/* Notice Box */}
                <div className="max-w-3xl mx-auto bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300 flex gap-3 items-start text-left">
                    <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">⚡ 글자 수 제한 및 속도 최적화</p>
                        <p className="opacity-90">
                            긴 텍스트는 생성 시간이 기하급수적으로 늘어납니다. <br/>
                            최대 <span className="font-bold text-red-500">300자</span>로 입력을 제한하여 3~5초 이내에 빠른 생성이 가능하도록 최적화했습니다. 
                            (300자는 쇼츠 한 편 분량으로 충분합니다)
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 h-full flex flex-col">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex justify-between">
                            <span>대본 입력</span>
                            <span className={`text-xs ${text.length >= MAX_CHARS ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                {text.length} / {MAX_CHARS}자
                            </span>
                        </label>
                        <textarea
                            value={text}
                            onChange={handleTextChange}
                            placeholder="여기에 대본을 입력하세요... (예: 안녕하세요! 오늘은 정말 특별한 꿀팁을 알려드릴게요.)"
                            className="w-full flex-grow min-h-[300px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 resize-none leading-relaxed text-lg"
                        />
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setText('')}
                                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                            >
                                전체 지우기
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls & Player */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 max-h-[600px] flex flex-col">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 sticky top-0 bg-white dark:bg-slate-800 z-10 pb-2">
                            목소리 선택 (10종)
                        </label>
                        
                        <div className="grid gap-3 overflow-y-auto custom-scrollbar pr-2 flex-grow mb-6">
                            {voicePresets.map((voice) => (
                                <button
                                    key={voice.id}
                                    onClick={() => setSelectedPresetId(voice.id)}
                                    className={`relative flex items-start p-3 rounded-xl border transition-all text-left group ${
                                        selectedPresetId === voice.id
                                            ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 ring-1 ring-teal-500'
                                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700'
                                    }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold mr-3 ${
                                        voice.gender === 'Female' 
                                        ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' 
                                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                        {voice.gender === 'Female' ? 'F' : 'M'}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-sm font-bold truncate ${selectedPresetId === voice.id ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {voice.label}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                voice.gender === 'Female'
                                                ? 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-900/20 dark:border-pink-800'
                                                : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                            }`}>
                                                {voice.gender}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {voice.description}
                                        </p>
                                    </div>
                                    
                                    {selectedPresetId === voice.id && (
                                        <div className="absolute top-3 right-3">
                                            <CheckCircleIcon className="w-5 h-5 text-teal-500" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-auto shrink-0">
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !text.trim()}
                                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> 생성 중...</>
                                ) : (
                                    <><SpeakerWaveIcon className="w-5 h-5" /> 오디오 생성하기</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Result Player */}
                    {audioUrl && (
                        <div className="bg-[#1e293b] rounded-2xl p-6 shadow-lg border border-slate-700 animate-fade-in-up">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    생성 완료
                                </h3>
                                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">WAV format</span>
                            </div>
                            
                            {/* Visualizer Placeholder */}
                            <div className="h-12 bg-slate-800/50 rounded-lg mb-4 flex items-center justify-center gap-1 overflow-hidden px-4">
                                {[...Array(30)].map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="w-1 bg-teal-500 rounded-full animate-music-bar"
                                        style={{ 
                                            height: `${Math.max(20, Math.random() * 100)}%`,
                                            animationDelay: `${i * 0.05}s`
                                        }}
                                    ></div>
                                ))}
                            </div>

                            <audio ref={audioRef} controls src={audioUrl} className="w-full mb-4 h-10" />
                            
                            <a 
                                href={audioUrl} 
                                download={`voice_${selectedPreset?.voiceName}_${Date.now()}.wav`}
                                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <DownloadIcon className="w-5 h-5" /> 다운로드
                            </a>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-center text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes music-bar {
                    0%, 100% { height: 20%; }
                    50% { height: 80%; }
                }
                .animate-music-bar {
                    animation: music-bar 1s ease-in-out infinite;
                }
                /* Custom Scrollbar within the component */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 3px;
                }
            `}</style>
        </div>
    );
};

export default VoiceStudioView;
