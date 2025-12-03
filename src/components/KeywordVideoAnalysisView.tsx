
import React, { useState, useMemo, useEffect } from 'react';
import { analyzeVideosByKeyword, generateKeywordStrategyAnalysis, initGoogleClient, getVideoCategories } from '../services/youtubeService';
import { isFavorite, addToFavorites, removeFromFavoritesByValue, getFolders } from '../services/storageService';
import type { AnalyzedVideo, StrategyResult, VideoCategory, Folder } from '../types';
import ExportButtons from './ExportButtons';
import StrategyModal from './StrategyModal';
import { SearchIcon, BrainIcon, ChartBarIcon, ViewIcon, LikeIcon, InformationCircleIcon, BookmarkIcon, YouTubeIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KeywordVideoAnalysisViewProps {
    initialQuery?: string;
    onAnalyzeChannel?: (channelId: string) => void;
}

type SortOrder = 'popularity' | 'views' | 'date';
type VideoTypeFilter = 'all' | 'short' | 'regular';
type CountryFilter = 'all' | 'korea' | 'foreign';

const KeywordVideoAnalysisView: React.FC<KeywordVideoAnalysisViewProps> = ({ initialQuery, onAnalyzeChannel }) => {
    const [query, setQuery] = useState(initialQuery || '');
    const [analyzeCount, setAnalyzeCount] = useState<number>(200);
    const [categoryId, setCategoryId] = useState<string>('0');
    const [videoDuration, setVideoDuration] = useState<string>('any');
    const [minViews, setMinViews] = useState<number>(0); // Min views filter
    const [categories, setCategories] = useState<VideoCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState<number>(0);
    const [videos, setVideos] = useState<AnalyzedVideo[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    // Filters & Sort
    const [sortOrder, setSortOrder] = useState<SortOrder>('popularity');
    const [videoTypeFilter, setVideoTypeFilter] = useState<VideoTypeFilter>('all');
    const [countryFilter, setCountryFilter] = useState<CountryFilter>('all');

    // Strategy Modal State
    const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
    const [isStrategyLoading, setIsStrategyLoading] = useState(false);
    const [strategyError, setStrategyError] = useState<string | null>(null);
    const [strategyResult, setStrategyResult] = useState<StrategyResult | null>(null);

    // Favorites
    const [folders, setFolders] = useState<Folder[]>([]);
    const [activeVideoIdForFolderSelect, setActiveVideoIdForFolderSelect] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Dummy state to trigger re-render for favorites

    useEffect(() => {
        const loadCategories = async () => {
            try {
                await initGoogleClient().catch(() => {}); 
                const cats = await getVideoCategories();
                setCategories(cats);
            } catch (e) {
                console.error('Failed to load categories', e);
                const cats = await getVideoCategories();
                setCategories(cats);
            }
        };
        loadCategories();
    }, []);

    // Close folder dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveVideoIdForFolderSelect(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setVideos([]);
        setProgress(0);

        try {
            await initGoogleClient();
            const results = await analyzeVideosByKeyword(
                query.trim(), 
                analyzeCount, 
                categoryId,
                videoDuration,
                (count) => setProgress(count)
            );
            
            if (results.length === 0) {
                setError('검색된 영상이 없습니다. 다른 키워드나 카테고리로 시도해보세요.');
            } else {
                setVideos(results);
            }
        } catch (err: any) {
            setError(err.message || '영상 검색 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateStrategy = async () => {
        if (!query.trim()) return;
        setIsStrategyModalOpen(true);
        setIsStrategyLoading(true);
        setStrategyError(null);
        setStrategyResult(null);

        try {
            const result = await generateKeywordStrategyAnalysis(query.trim());
            setStrategyResult(result);
        } catch (err: any) {
            setStrategyError(err.message || '전략 생성 중 오류가 발생했습니다.');
        } finally {
            setIsStrategyLoading(false);
        }
    };

    // Favorites Handling
    const toggleFavorite = (e: React.MouseEvent, video: AnalyzedVideo) => {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if (isFavorite('video', video.id)) {
            removeFromFavoritesByValue('video', video.id);
            setRefreshTrigger(prev => prev + 1);
        } else {
            setFolders(getFolders());
            setActiveVideoIdForFolderSelect(video.id);
        }
    };

    const handleAddToFolder = (e: React.MouseEvent, folderId: string, video: AnalyzedVideo) => {
        e.stopPropagation();
        addToFavorites({
            type: 'video',
            value: video.id,
            title: video.title,
            thumbnailUrl: video.thumbnailUrl,
            folderId
        });
        setActiveVideoIdForFolderSelect(null);
        setRefreshTrigger(prev => prev + 1);
    };

    // Sorting and Filtering
    const filteredVideos = useMemo(() => {
        let result = videos.filter(video => {
            if (countryFilter === 'korea' && video.country && video.country !== 'KR') return false;
            if (countryFilter === 'foreign' && video.country === 'KR') return false;
            if (videoTypeFilter === 'short' && video.videoType !== 'short') return false;
            if (videoTypeFilter === 'regular' && video.videoType !== 'regular') return false;
            if (video.viewCount < minViews) return false;
            return true;
        });

        if (sortOrder === 'popularity') {
            result.sort((a, b) => b.popularityScore - a.popularityScore);
        } else if (sortOrder === 'views') {
            result.sort((a, b) => b.viewCount - a.viewCount);
        } else if (sortOrder === 'date') {
            result.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        }
        return result;
    }, [videos, countryFilter, videoTypeFilter, sortOrder, minViews]);

    const totalStats = useMemo(() => {
        return videos.reduce((acc, v) => ({
            views: acc.views + v.viewCount,
            likes: acc.likes + v.likeCount,
            comments: acc.comments + v.commentCount
        }), { views: 0, likes: 0, comments: 0 });
    }, [videos]);

    const formatNumber = (num: number) => new Intl.NumberFormat('ko-KR', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

    const chartData = useMemo(() => {
        return filteredVideos.slice(0, 50).map(v => ({
            name: v.title.length > 10 ? v.title.substring(0, 10) + '...' : v.title,
            fullTitle: v.title,
            score: v.popularityScore
        }));
    }, [filteredVideos]);

    return (
        <div className="space-y-6 font-sans animate-fade-in-up pb-12">
            
            {/* Header Section */}
            <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg border border-slate-700 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
                        <YouTubeIcon className="w-6 h-6 text-red-500" />
                        떡상 영상 분석
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm align-middle">PRO</span>
                    </h2>
                    <p className="text-slate-400 text-sm">
                        키워드를 입력하여 상위 노출되는 인기 영상들을 심층 분석합니다.
                    </p>
                </div>
            </div>

            {/* Search Bar Area */}
            <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg border border-slate-700">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-grow w-full md:w-auto">
                        <div className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="분석할 키워드를 입력하세요"
                                className="w-full pl-4 pr-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-400"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <select 
                            value={categoryId} 
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer min-w-[140px] flex-1 md:flex-none"
                            disabled={isLoading}
                        >
                            <option value="0">모든 카테고리</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>

                        <select 
                            value={videoDuration} 
                            onChange={(e) => setVideoDuration(e.target.value)}
                            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer min-w-[130px] flex-1 md:flex-none"
                            disabled={isLoading}
                        >
                            <option value="any">전체 길이</option>
                            <option value="short">4분 이하 (숏폼)</option>
                            <option value="medium">4분 ~ 20분</option>
                            <option value="long">20분 이상</option>
                        </select>

                        <select 
                            value={minViews}
                            onChange={(e) => setMinViews(Number(e.target.value))}
                            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer min-w-[130px] flex-1 md:flex-none"
                            disabled={isLoading}
                        >
                            <option value="0">전체 조회수</option>
                            <option value="10000">1만회 이상</option>
                            <option value="50000">5만회 이상</option>
                            <option value="100000">10만회 이상</option>
                            <option value="500000">50만회 이상</option>
                            <option value="1000000">100만회 이상</option>
                        </select>
                        
                        <select 
                            value={analyzeCount} 
                            onChange={(e) => setAnalyzeCount(Number(e.target.value))}
                            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer min-w-[110px] flex-1 md:flex-none"
                            disabled={isLoading}
                        >
                            <option value="50">50개</option>
                            <option value="100">100개</option>
                            <option value="200">200개</option>
                        </select>

                        <button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:bg-slate-600 flex items-center justify-center gap-2 whitespace-nowrap flex-1 md:flex-none"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <SearchIcon />
                            )}
                        </button>
                    </div>
                </form>
                <p className="text-xs text-slate-400 mt-2 text-center md:text-left">
                    <InformationCircleIcon className="w-3 h-3 inline mr-1"/>
                    더 많은 영상을 분석하면 API 할당량 소모가 증가하고 분석 시간이 길어질 수 있습니다.
                </p>
            </div>

            {isLoading && progress > 0 && (
                <div className="text-center py-8">
                    <div className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">데이터 수집 중...</div>
                    <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                        <div 
                            className="bg-red-600 h-full transition-all duration-300 flex items-center justify-center text-[10px] text-white font-bold"
                            style={{ width: `${Math.min((progress / analyzeCount) * 100, 100)}%` }}
                        >
                            {progress} / {analyzeCount}
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-6 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/30 rounded-xl text-center shadow-sm">
                    <div className="text-red-500 text-4xl mb-3"><i className="fas fa-exclamation-triangle"></i></div>
                    <p className="text-red-600 dark:text-red-400 font-bold text-lg">{error}</p>
                </div>
            )}

            {videos.length > 0 && !isLoading && (
                <>
                    {/* Dashboard Header */}
                    <div className="bg-[#1e293b] text-white p-6 rounded-xl shadow-lg border border-slate-700">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <div className="p-2 bg-slate-700 rounded-full"><SearchIcon /></div>
                                    <h2 className="text-2xl font-bold">키워드: "{query}"</h2>
                                </div>
                                <p className="text-slate-400 text-sm ml-1">
                                    검색 결과 분석 (상위 {videos.length}개 영상 / 목표 {analyzeCount}개)
                                </p>
                            </div>
                            
                            <div className="flex gap-8 text-center">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">총 조회수</p>
                                    <p className="text-2xl font-bold text-red-400">{formatNumber(totalStats.views)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">총 좋아요</p>
                                    <p className="text-2xl font-bold text-slate-200">{formatNumber(totalStats.likes)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">총 댓글</p>
                                    <p className="text-2xl font-bold text-slate-200">{formatNumber(totalStats.comments)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-[#1e293b] p-6 rounded-xl shadow-lg border border-slate-700">
                        <h3 className="text-white font-bold mb-4 text-sm">"{query}" 검색 결과 인기 점수 분포 (상위 {Math.min(50, videos.length)}개)</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        formatter={(value: number) => [value.toFixed(1), '인기 점수']}
                                        labelFormatter={(label) => ''}
                                    />
                                    <Bar dataKey="score" fill="#ef4444" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="bg-[#1e293b] p-3 rounded-xl shadow-lg border border-slate-700 flex flex-wrap gap-3 justify-between items-center">
                        <div className="flex flex-wrap gap-2">
                            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-600">
                                <button onClick={() => setCountryFilter('all')} className={`px-3 py-1 text-xs font-bold rounded ${countryFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>전체</button>
                                <button onClick={() => setCountryFilter('korea')} className={`px-3 py-1 text-xs font-bold rounded ${countryFilter === 'korea' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>한국</button>
                                <button onClick={() => setCountryFilter('foreign')} className={`px-3 py-1 text-xs font-bold rounded ${countryFilter === 'foreign' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>해외</button>
                            </div>
                            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-600">
                                <button onClick={() => setVideoTypeFilter('all')} className={`px-3 py-1 text-xs font-bold rounded ${videoTypeFilter === 'all' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>전체</button>
                                <button onClick={() => setVideoTypeFilter('regular')} className={`px-3 py-1 text-xs font-bold rounded ${videoTypeFilter === 'regular' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>일반 영상</button>
                                <button onClick={() => setVideoTypeFilter('short')} className={`px-3 py-1 text-xs font-bold rounded ${videoTypeFilter === 'short' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>쇼츠</button>
                            </div>
                            <div className="flex items-center bg-slate-800 px-3 py-1 rounded-lg border border-slate-600">
                                <span className="text-xs text-slate-400 mr-2">정렬:</span>
                                <select 
                                    value={sortOrder} 
                                    onChange={(e) => setSortOrder(e.target.value as any)}
                                    className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="popularity">인기순</option>
                                    <option value="views">조회수순</option>
                                    <option value="date">최신순</option>
                                </select>
                            </div>
                            
                            <button 
                                onClick={handleGenerateStrategy}
                                className="px-4 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                            >
                                <BrainIcon className="w-3 h-3" /> AI 경쟁 전략 분석
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <ExportButtons data={filteredVideos} exportTitle={query} />
                        </div>
                    </div>

                    {/* Video List */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredVideos.map((video, index) => (
                            <div key={video.id} className="bg-[#1e293b] rounded-lg border border-slate-700 overflow-hidden flex flex-col sm:flex-row group hover:border-slate-500 transition-colors relative">
                                <div className="sm:w-40 md:w-48 h-28 sm:h-auto relative flex-shrink-0">
                                    <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                                        <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-1 left-1 bg-black/80 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                            {index + 1}
                                        </div>
                                        {video.videoType === 'short' && <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-bold px-1 rounded">SHORTS</span>}
                                    </a>
                                </div>
                                <div className="p-3 flex flex-col justify-between flex-grow min-w-0">
                                    <div className="relative pr-8">
                                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">
                                            <h4 className="text-white font-bold text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">{video.title}</h4>
                                        </a>
                                        
                                        {/* Bookmark Button */}
                                        <div className="absolute top-0 right-0">
                                            <button 
                                                onClick={(e) => toggleFavorite(e, video)}
                                                className={`p-1 rounded hover:bg-slate-700 transition-colors ${isFavorite('video', video.id) ? 'text-yellow-500' : 'text-slate-500 hover:text-yellow-500'}`}
                                                title="영상 즐겨찾기"
                                            >
                                                <BookmarkIcon className={`w-4 h-4 ${isFavorite('video', video.id) ? 'fill-current' : ''}`} />
                                            </button>
                                            
                                            {activeVideoIdForFolderSelect === video.id && (
                                                <div className="absolute right-0 top-6 w-40 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-20 animate-fade-in-up">
                                                    <div className="p-2 border-b border-slate-700 text-[10px] font-bold text-slate-400">폴더 선택</div>
                                                    <button onClick={(e) => handleAddToFolder(e, 'uncategorized', video)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white">미분류</button>
                                                    {folders.map(f => (
                                                        <button key={f.id} onClick={(e) => handleAddToFolder(e, f.id, video)} className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white truncate">
                                                            {f.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-slate-400 truncate pr-2">{video.channelTitle}</p>
                                            <button 
                                                onClick={() => onAnalyzeChannel && onAnalyzeChannel(video.channelId)}
                                                className="text-[10px] text-red-400 border border-red-400/30 px-1.5 py-0.5 rounded hover:bg-red-400/10 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                                            >
                                                <ChartBarIcon className="w-3 h-3" /> 채널 분석
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">게시일: {new Date(video.publishedAt).toLocaleDateString()}</p>
                                    </div>
                                    
                                    <div className="mt-2 pt-2 border-t border-slate-700 flex items-center justify-between">
                                        <div className="flex gap-3 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><ViewIcon className="w-3 h-3"/> {formatNumber(video.viewCount)}</span>
                                            <span className="flex items-center gap-1"><LikeIcon className="w-3 h-3"/> {formatNumber(video.likeCount)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-slate-500">인기 점수</span>
                                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-red-500" style={{ width: `${video.popularityScore}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-white">{video.popularityScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <StrategyModal
                isOpen={isStrategyModalOpen}
                onClose={() => setIsStrategyModalOpen(false)}
                strategy={strategyResult}
                isLoading={isStrategyLoading}
                error={strategyError}
                title="AI 키워드 전략 분석"
            />
            
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

export default KeywordVideoAnalysisView;
