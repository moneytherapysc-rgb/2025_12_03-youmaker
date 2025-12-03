
import React, { useState, useRef } from 'react';
import { generateAIImage, editAIImage, fileToBase64 } from '../services/youtubeService';
import { PaletteIcon, MagicWandIcon, PhotoIcon, UploadIcon, CheckCircleIcon, LightningIcon, PencilIcon } from './icons';

type Mode = 'create' | 'edit';

const ImageGenView: React.FC = () => {
    const [mode, setMode] = useState<Mode>('create');
    
    // Creation State
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [style, setStyle] = useState('');
    
    // Edit State
    const [editImage, setEditImage] = useState<File | null>(null);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');

    // Common State
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const ratios = [
        { label: '1:1', value: '1:1' },
        { label: '16:9', value: '16:9' },
        { label: '9:16', value: '9:16' },
        { label: '4:3', value: '4:3' },
        { label: '3:4', value: '3:4' },
    ];

    const styles = [
        { label: '실사 (Photorealistic)', value: 'photorealistic, 4k, highly detailed' },
        { label: '수채화 (Watercolor)', value: 'watercolor painting style, soft colors' },
        { label: '시네마틱 (Cinematic)', value: 'cinematic lighting, movie scene, dramatic' },
        { label: '사이버펑크 (Cyberpunk)', value: 'cyberpunk style, neon lights, futuristic' },
        { label: '픽셀아트 (Pixel Art)', value: 'pixel art style, retro game' },
        { label: '스케치 (Sketch)', value: 'pencil sketch, drawing style' },
        { label: '3D 캐릭터 (3D Render)', value: '3d render, character design, cute, unreal engine' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditImage(file);
            setEditPreview(URL.createObjectURL(file));
            setResultImage(null);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const fullPrompt = style ? `${prompt}, ${style}` : prompt;
            const image = await generateAIImage(fullPrompt, aspectRatio);
            setResultImage(image);
        } catch (err: any) {
            setError(err.message || "이미지 생성 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!editImage || !editPrompt.trim()) return;
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const base64 = await fileToBase64(editImage);
            const image = await editAIImage(base64, editPrompt);
            setResultImage(image);
        } catch (err: any) {
            setError(err.message || "이미지 편집 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 font-sans animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-10 pt-8">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-4 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    Powered by Gemini 2.5 Flash
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                        상상을 현실로 그려보세요
                    </span>
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    텍스트만으로 놀라운 고화질 이미지를 생성합니다.<br/>
                    나노 바나나 모델의 강력한 성능을 경험해보세요.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700 shadow-2xl">
                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-900 rounded-xl mb-6">
                            <button 
                                onClick={() => { setMode('create'); setResultImage(null); }}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'create' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <PaletteIcon className="w-4 h-4" /> 이미지 생성
                            </button>
                            <button 
                                onClick={() => { setMode('edit'); setResultImage(null); }}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'edit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                <MagicWandIcon className="w-4 h-4" /> 이미지 편집
                            </button>
                        </div>

                        {mode === 'create' ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">화면 비율</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {ratios.map(r => (
                                            <button 
                                                key={r.value}
                                                onClick={() => setAspectRatio(r.value)}
                                                className={`py-2 text-xs font-bold rounded-lg border transition-all ${aspectRatio === r.value ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                            >
                                                {r.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">프롬프트 입력</label>
                                    <textarea 
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="예: 우주복을 입은 고양이가 달에서 서핑하는 모습, 4k, 고화질"
                                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">스타일 (선택)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {styles.map(s => (
                                            <button 
                                                key={s.label}
                                                onClick={() => setStyle(style === s.value ? '' : s.value)}
                                                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${style === s.value ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                                            >
                                                {s.label.split(' (')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleGenerate}
                                    disabled={isLoading || !prompt.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> 생성 중...</>
                                    ) : (
                                        <><MagicWandIcon className="w-5 h-5"/> 이미지 생성하기</>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">원본 이미지 업로드</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative h-48 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-900 flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group"
                                    >
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                        {editPreview ? (
                                            <>
                                                <img src={editPreview} alt="Upload" className="w-full h-full object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <p className="text-white font-bold bg-black/50 px-3 py-1 rounded-full">이미지 변경</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <UploadIcon className="w-10 h-10 text-slate-500 mb-2 group-hover:text-indigo-500 transition-colors" />
                                                <p className="text-slate-500 text-sm">클릭하여 이미지 업로드</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">편집 명령 (프롬프트)</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={editPrompt}
                                            onChange={(e) => setEditPrompt(e.target.value)}
                                            placeholder="예: 선글라스 씌워줘, 배경을 우주로 바꿔줘"
                                            className="w-full pl-4 pr-20 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                                        />
                                        <button className="absolute right-2 top-2 bg-slate-800 text-xs font-bold text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-700">
                                            추가
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">* 'AI 매직'이 문맥을 이해하여 이미지를 자연스럽게 수정합니다.</p>
                                </div>

                                <button 
                                    onClick={handleEdit}
                                    disabled={isLoading || !editImage || !editPrompt.trim()}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
                                >
                                    {isLoading ? '편집 중...' : 'AI 편집하기'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 text-center">
                            <div className="w-8 h-8 bg-indigo-900/50 text-indigo-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <LightningIcon className="w-5 h-5" />
                            </div>
                            <h4 className="text-white font-bold text-xs mb-1">초고속 생성</h4>
                            <p className="text-[10px] text-slate-500">Gemini 2.5 Flash 모델 사용</p>
                        </div>
                        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 text-center">
                            <div className="w-8 h-8 bg-purple-900/50 text-purple-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <PhotoIcon className="w-5 h-5" />
                            </div>
                            <h4 className="text-white font-bold text-xs mb-1">다양한 화풍</h4>
                            <p className="text-[10px] text-slate-500">실사, 수채화, 3D 렌더링 등</p>
                        </div>
                        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700 text-center">
                            <div className="w-8 h-8 bg-blue-900/50 text-blue-400 rounded-lg flex items-center justify-center mx-auto mb-2">
                                <PencilIcon className="w-5 h-5" />
                            </div>
                            <h4 className="text-white font-bold text-xs mb-1">스마트 에디터</h4>
                            <p className="text-[10px] text-slate-500">자연어 명령으로 편집 가능</p>
                        </div>
                    </div>
                </div>

                {/* Result Display */}
                <div className="lg:col-span-7">
                    <div className="h-full min-h-[500px] bg-[#0f172a] rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                        {isLoading ? (
                            <div className="text-center z-10">
                                <div className="relative w-24 h-24 mx-auto mb-6">
                                    <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <MagicWandIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">AI가 이미지를 그리고 있습니다...</h3>
                                <p className="text-slate-400">잠시만 기다려주세요. 놀라운 결과물을 준비 중입니다.</p>
                            </div>
                        ) : resultImage ? (
                            <div className="relative w-full h-full p-4 flex items-center justify-center group">
                                <img 
                                    src={resultImage} 
                                    alt="AI Generated" 
                                    className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" 
                                />
                                <div className="absolute bottom-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a 
                                        href={resultImage} 
                                        download={`ai-generated-${Date.now()}.png`}
                                        className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
                                    >
                                        <UploadIcon className="w-5 h-5 rotate-180" /> 다운로드
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-30 select-none">
                                <PhotoIcon className="w-24 h-24 mx-auto mb-4" />
                                <h3 className="text-2xl font-bold">결과가 여기에 표시됩니다</h3>
                                <p className="mt-2">왼쪽 패널에서 설정을 마치고<br/>'생성하기' 버튼을 누르세요.</p>
                            </div>
                        )}
                        
                        {/* Background Effect */}
                        {!resultImage && !isLoading && (
                            <div className="absolute inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-900/50 border border-red-800 rounded-xl text-red-200 text-center max-w-2xl mx-auto">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                </div>
            )}
        </div>
    );
};

export default ImageGenView;
