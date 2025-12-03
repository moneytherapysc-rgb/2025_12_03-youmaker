import { GoogleGenAI, Schema, Type } from "@google/genai";
import type { 
    AnalyzedVideo, 
    YouTubeChannel, 
    ChannelExtraStats, 
    StrategyResult, 
    GrowthAnalysisResult, 
    ConsultingResult,
    VideoCategory,
    TrendingKeyword,
    RisingCreator,
    KeywordAnalysisResult,
    ThumbnailAnalysisResult,
    CommentAnalysisResult,
    ChannelBattleResult,
    GeneratedShortsScript,
    GeneratedScript,
    SummaryObject,
    GeneratedTitles,
    GeneratedThumbnailText,
    TrendInsightResult,
    GoogleTrendItem,
    NewsItem,
    BattleStats
} from '../types';
import { getActiveInstruction } from './instructionService';

const SUPABASE_URL_STORAGE_KEY = 'yt_macgyver_supabase_url';
const SUPABASE_KEY_STORAGE_KEY = 'yt_macgyver_supabase_key';

// --- Default Objects for Robustness ---
const defaultStrategy: StrategyResult = {
    coreConcept: { title: '분석 실패', description: '데이터를 분석할 수 없습니다.' },
    detailedPlan: {
        contentDirection: { title: '', details: '' },
        uploadSchedule: { title: '', details: '' },
        communityEngagement: { title: '', details: '' },
        keywordStrategy: { title: '', details: '' }
    },
    initialStrategy: { title: '', phases: [] },
    suggestedTitles: { title: '', titles: [] },
    kpiSettings: { title: '', kpis: [] },
    riskManagement: { title: '', risks: [] },
    revenueModel: { title: '', streams: [] }
};

const defaultGrowth: GrowthAnalysisResult = {
    title: '분석 실패',
    overallSummary: '데이터를 불러올 수 없습니다.',
    phases: []
};

const defaultConsulting: ConsultingResult = {
    overallDiagnosis: { title: '진단 실패', summary: '데이터를 불러올 수 없습니다.' },
    detailedAnalysis: [],
    actionPlan: {
        shortTerm: { title: '', period: '', steps: [] },
        longTerm: { title: '', period: '', steps: [] }
    }
};

const defaultCommentAnalysis: CommentAnalysisResult = {
    sentiment: { positive: 0, negative: 0, neutral: 0 },
    keywords: [],
    summary: { pros: [], cons: [], oneLine: "분석 결과를 불러올 수 없습니다." }
};

const defaultThumbnailAnalysis: ThumbnailAnalysisResult = {
    overallScore: 0,
    scores: { visibility: 0, curiosity: 0, textReadability: 0, design: 0 },
    feedback: { strengths: [], weaknesses: [], improvements: [] }
};


// API Key Storage Keys
const YOUTUBE_API_KEY_STORAGE_KEY = 'yt_macgyver_youtube_api_key';
const GEMINI_API_KEY_STORAGE_KEY = 'yt_macgyver_gemini_api_key';

// YouTube API Key Functions
export const setYouTubeApiKey = (key: string) => localStorage.setItem(YOUTUBE_API_KEY_STORAGE_KEY, key);
export const getYouTubeApiKey = (): string | null => localStorage.getItem(YOUTUBE_API_KEY_STORAGE_KEY);

// Gemini API Key Functions
export const setGeminiApiKey = (key: string) => localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, key);
export const getGeminiApiKey = (): string | null => localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);

export const setSupabaseUrl = (url: string) => localStorage.setItem(SUPABASE_URL_STORAGE_KEY, url);
export const getSupabaseUrl = (): string | null => localStorage.getItem(SUPABASE_URL_STORAGE_KEY);

export const setSupabaseKey = (key: string) => localStorage.setItem(SUPABASE_KEY_STORAGE_KEY, key);
export const getSupabaseKey = (): string | null => localStorage.getItem(SUPABASE_KEY_STORAGE_KEY);

export const isApiKeySet = (): boolean => !!getYouTubeApiKey() && !!getGeminiApiKey() && !!getSupabaseUrl() && !!getSupabaseKey();

export const testApiKey = async (key: string) => {
    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=KR&maxResults=1&key=${key}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return { success: true };
    } catch (error: any) {
        return { success: false, error };
    }
};

export const testGeminiApiKey = async (key: string) => {
    try {
        const ai = new GoogleGenAI({ apiKey: key });
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Test connection',
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error };
    }
};

const getClient = () => {
    const apiKey = getGeminiApiKey(); 
    if (!apiKey) throw new Error("Gemini API Key가 설정되지 않았습니다. API 키 설정 메뉴에서 키를 입력해주세요.");
    return new GoogleGenAI({ apiKey });
};

const cleanControlChars = (str: string): string => {
  let inString = false;
  let result = '';
  const len = str.length;
  
  for (let i = 0; i < len; i++) {
    const char = str[i];
    
    if (char === '"') {
        let backslashCount = 0;
        let j = i - 1;
        while (j >= 0 && str[j] === '\\') {
            backslashCount++;
            j--;
        }
        if (backslashCount % 2 === 0) {
            inString = !inString;
        }
    }
    
    if (inString) {
      switch (char) {
        case '\n': result += '\\n'; break;
        case '\r': result += '\\r'; break;
        case '\t': result += '\\t'; break;
        case '\b': result += '\\b'; break;
        case '\f': result += '\\f'; break;
        default: result += char;
      }
    } else {
      result += char;
    }
  }
  return result;
};

const parseJsonClean = (text: string | undefined): any => {
    if (!text) return null;
    try {
        let cleaned = text.replace(/```json\s*|```/g, '').trim();
        
        // Find valid JSON start and end
        const firstCurly = cleaned.indexOf('{');
        const firstSquare = cleaned.indexOf('[');
        let startIndex = -1;
        
        if (firstSquare !== -1 && (firstCurly === -1 || firstSquare < firstCurly)) {
            startIndex = firstSquare;
        } else if (firstCurly !== -1) {
            startIndex = firstCurly;
        }

        if (startIndex !== -1) {
            cleaned = cleaned.substring(startIndex);
            
            const lastCurly = cleaned.lastIndexOf('}');
            const lastSquare = cleaned.lastIndexOf(']');
            let endIndex = -1;
            
            if (lastSquare !== -1 && (lastCurly === -1 || lastSquare > lastCurly)) {
                endIndex = lastSquare;
            } else if (lastCurly !== -1) {
                endIndex = lastCurly;
            }
            
            if (endIndex !== -1) {
                cleaned = cleaned.substring(0, endIndex + 1);
            } else {
                console.warn("JSON appears truncated, skipping parse.");
                return null;
            }
        } else {
            return null;
        }

        cleaned = cleaned
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/,(\s*[\]}])/g, '$1')
            .replace(/([0-9]+)\s*\.\.\.\s*([\]}])/g, '$1$2')
            .replace(/}\s*,\s*\.\.\.\s*]/g, '}]')
            .replace(/]\s*,\s*\.\.\.\s*]/g, ']]')
            .replace(/"\s+"\s*:/g, '":')
            .replace(/:\s*"/g, ':"')
            .replace(/"\s+(?=")/g, '", ')
            .replace(/,\s*$/g, ''); 

        cleaned = cleanControlChars(cleaned);

        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error", e);
        return null;
    }
};

export const initGoogleClient = async () => getClient();

const fetchYouTube = async (endpoint: string, params: Record<string, string>) => {
    const key = getYouTubeApiKey();
    if (!key) throw new Error("YouTube API 키가 필요합니다.");
    const query = new URLSearchParams({ ...params, key }).toString();
    const response = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}?${query}`);
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return data;
};

const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = (parseInt(match[1] || '0'));
    const minutes = (parseInt(match[2] || '0'));
    const seconds = (parseInt(match[3] || '0'));
    return hours * 3600 + minutes * 60 + seconds;
};

export const findChannel = async (channelIdOrName: string): Promise<YouTubeChannel> => {
    try {
        const data = await fetchYouTube('channels', { part: 'snippet,statistics,contentDetails', id: channelIdOrName });
        if (data.items?.length) return mapChannel(data.items[0]);
    } catch (e) {}

    const searchData = await fetchYouTube('search', { part: 'snippet', type: 'channel', q: channelIdOrName, maxResults: '1' });
    if (!searchData.items?.length) throw new Error("채널을 찾을 수 없습니다.");
    
    const channelId = searchData.items[0].snippet.channelId;
    const data = await fetchYouTube('channels', { part: 'snippet,statistics,contentDetails', id: channelId });
    return mapChannel(data.items[0]);
};

const mapChannel = (item: any): YouTubeChannel => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
    videoCount: parseInt(item.statistics.videoCount),
    publishedAt: item.snippet.publishedAt,
    subscriberCount: parseInt(item.statistics.subscriberCount),
    viewCount: parseInt(item.statistics.viewCount)
});

export const analyzeChannelVideos = async (query: string): Promise<{ videos: AnalyzedVideo[], stats: ChannelExtraStats }> => {
    const channel = await findChannel(query);
    const plData = await fetchYouTube('playlistItems', { part: 'snippet,contentDetails', playlistId: channel.uploadsPlaylistId, maxResults: '50' });
    
    if (!plData.items?.length) return { videos: [], stats: { firstVideoDate: '', averageUploadIntervalAll: '', averageUploadIntervalRecent: '' } };

    const videoIds = plData.items.map((i: any) => i.contentDetails.videoId).join(',');
    const vData = await fetchYouTube('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
    
    const videos: AnalyzedVideo[] = vData.items.map((item: any) => {
        const stats = item.statistics;
        const duration = parseDuration(item.contentDetails.duration);
        const viewCount = parseInt(stats.viewCount || '0');
        const likeCount = parseInt(stats.likeCount || '0');
        const commentCount = parseInt(stats.commentCount || '0');
        
        const popularityScore = Math.min((viewCount / 10000) * 0.6 + (likeCount / 100) * 0.3 + (commentCount / 10) * 0.1, 100);

        return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
            tags: item.snippet.tags || [],
            hashtags: (item.snippet.description?.match(/#[^\s#]+/g) || []).map((t: string) => t.slice(1)),
            duration,
            videoType: duration <= 60 ? 'short' : 'regular',
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            viewCount,
            likeCount,
            commentCount,
            popularityScore
        };
    });

    const sortedVideos = [...videos].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
    const firstVideoDate = sortedVideos[0]?.publishedAt || '';
    
    let totalInterval = 0;
    for(let i=1; i<sortedVideos.length; i++) {
        totalInterval += new Date(sortedVideos[i].publishedAt).getTime() - new Date(sortedVideos[i-1].publishedAt).getTime();
    }
    const avgIntervalAll = sortedVideos.length > 1 ? totalInterval / (sortedVideos.length - 1) : 0;
    
    const recentVideos = sortedVideos.slice(-5);
    let recentInterval = 0;
    for(let i=1; i<recentVideos.length; i++) {
        recentInterval += new Date(recentVideos[i].publishedAt).getTime() - new Date(recentVideos[i-1].publishedAt).getTime();
    }
    const avgIntervalRecent = recentVideos.length > 1 ? recentInterval / (recentVideos.length - 1) : 0;

    const formatInterval = (ms: number) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        return `${days}일`;
    };

    return { 
        videos: videos.sort((a, b) => b.viewCount - a.viewCount), 
        stats: {
            firstVideoDate,
            averageUploadIntervalAll: formatInterval(avgIntervalAll),
            averageUploadIntervalRecent: formatInterval(avgIntervalRecent)
        }
    };
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string ? (reader.result as string).split(',')[1] : '');
        reader.onerror = error => reject(error);
    });
};

export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const pcmToWav = (pcmData: Uint8Array, sampleRate = 24000, numChannels = 1): Blob => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);

    const pcmArray = new Uint8Array(buffer, 44);
    pcmArray.set(pcmData);

    return new Blob([buffer], { type: 'audio/wav' });
};

export const summarizeTranscript = async (text: string): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `다음 내용을 3줄로 요약해줘:\n${text}`,
    });
    return response.text || '';
};

export const generateChannelStrategy = async (videos: AnalyzedVideo[]): Promise<StrategyResult> => {
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    const prompt = `
    ${activeInstruction.content}
    Analyze these videos and provide a channel strategy in JSON format conforming to StrategyResult interface. 
    Videos: ${JSON.stringify(videos.slice(0, 10).map(v => ({title: v.title, views: v.viewCount})))}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    const result = parseJsonClean(response.text) || {};
    // Defensive merge to ensure arrays exist
    return {
        ...defaultStrategy,
        ...result,
        initialStrategy: { ...defaultStrategy.initialStrategy, ...(result.initialStrategy || {}) },
        detailedPlan: { ...defaultStrategy.detailedPlan, ...(result.detailedPlan || {}) },
        suggestedTitles: { ...defaultStrategy.suggestedTitles, ...(result.suggestedTitles || {}) },
        kpiSettings: { ...defaultStrategy.kpiSettings, ...(result.kpiSettings || {}) },
        riskManagement: { ...defaultStrategy.riskManagement, ...(result.riskManagement || {}) },
        revenueModel: { ...defaultStrategy.revenueModel, ...(result.revenueModel || {}) },
    };
};

export const generateChannelGrowthAnalysis = async (videos: AnalyzedVideo[]): Promise<GrowthAnalysisResult> => {
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    const prompt = `
    ${activeInstruction.content}
    Analyze channel growth based on these videos and return JSON matching GrowthAnalysisResult interface.
    Videos: ${JSON.stringify(videos.slice(0, 20).map(v => ({title: v.title, date: v.publishedAt, views: v.viewCount})))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    const result = parseJsonClean(response.text) || {};
    return {
        ...defaultGrowth,
        ...result,
        phases: Array.isArray(result.phases) ? result.phases : []
    };
};

export const generateChannelConsulting = async (videos: AnalyzedVideo[]): Promise<ConsultingResult> => {
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    const prompt = `
    ${activeInstruction.content}
    Provide consulting for this channel based on video performance. Return JSON matching ConsultingResult interface.
    Videos: ${JSON.stringify(videos.slice(0, 10))}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    const result = parseJsonClean(response.text) || {};
    return {
        ...defaultConsulting,
        ...result,
        detailedAnalysis: Array.isArray(result.detailedAnalysis) ? result.detailedAnalysis : [],
        actionPlan: {
            shortTerm: { ...defaultConsulting.actionPlan.shortTerm, ...(result.actionPlan?.shortTerm || {}), steps: Array.isArray(result.actionPlan?.shortTerm?.steps) ? result.actionPlan.shortTerm.steps : [] },
            longTerm: { ...defaultConsulting.actionPlan.longTerm, ...(result.actionPlan?.longTerm || {}), steps: Array.isArray(result.actionPlan?.longTerm?.steps) ? result.actionPlan.longTerm.steps : [] }
        }
    };
};

export const cleanTranscript = async (script: string, instruction: string): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${instruction}\n\nClean and correct this transcript into a readable text format. Do not use JSON. Just return the text. Transcript:\n${script}`,
    });
    return response.text || '';
};

export const summarizeTranscriptForCreation = async (script: string, instruction: string): Promise<SummaryObject> => {
    const ai = getClient();
    const prompt = `
    ${instruction}
    
    [Task]
    Analyze the following transcript and summarize it for content creation.
    Output MUST be valid JSON matching the schema.
    Output Language: Korean (한국어)

    [Transcript]
    ${script}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    coreMessage: { type: Type.STRING },
                    structure: { type: Type.STRING },
                    summaryPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["title", "coreMessage", "structure", "summaryPoints"]
            }
        }
    });
    return parseJsonClean(response.text) || {};
};

export const recreateScriptFromSummary = async (summary: SummaryObject, context: any, instruction: string): Promise<GeneratedScript> => {
    const ai = getClient();
    const prompt = `
    ${instruction}

    [Task]
    Create a NEW creative script based on this summary.
    Do not copy the original. Re-write it for better engagement.
    Output MUST be valid JSON matching the schema.
    Output Language: Korean (한국어)

    [Summary]
    ${JSON.stringify(summary)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    script: {
                        type: Type.OBJECT,
                        properties: {
                            opening: {
                                type: Type.OBJECT,
                                properties: { narration: { type: Type.STRING }, visual_cue: { type: Type.STRING } },
                                required: ["narration", "visual_cue"]
                            },
                            main_points: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: { scene: { type: Type.STRING }, narration: { type: Type.STRING }, visual_cue: { type: Type.STRING } },
                                    required: ["scene", "narration", "visual_cue"]
                                }
                            },
                            closing: {
                                type: Type.OBJECT,
                                properties: { narration: { type: Type.STRING }, visual_cue: { type: Type.STRING } },
                                required: ["narration", "visual_cue"]
                            }
                        },
                        required: ["opening", "main_points", "closing"]
                    }
                },
                required: ["title", "description", "script"]
            }
        }
    });
    return parseJsonClean(response.text) || {};
};

export const generateTitlesFromScript = async (script: GeneratedScript, instruction: string): Promise<GeneratedTitles> => {
    const ai = getClient();
    const prompt = `
    ${instruction}

    [Task]
    Generate 10 catchy YouTube titles for this script.
    5 "Fresh" (Provocative/Curiosity) and 5 "Stable" (Information/Benefit).
    Output MUST be valid JSON matching the schema.
    Output Language: Korean (한국어)

    [Script Info]
    Title: ${script.title}
    Description: ${script.description}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    fresh: { type: Type.ARRAY, items: { type: Type.STRING } },
                    stable: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["fresh", "stable"]
            }
        }
    });
    return parseJsonClean(response.text) || {};
};

export const generateThumbnailTextFromTitles = async (titles: GeneratedTitles, instruction: string): Promise<GeneratedThumbnailText> => {
    const ai = getClient();
    const prompt = `
    ${instruction}

    [Task]
    Generate short, punchy thumbnail texts based on these titles.
    Categorize them into Emotional, Informational, and Visual.
    Output MUST be valid JSON matching the schema.
    Output Language: Korean (한국어)

    [Titles]
    ${JSON.stringify(titles)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    emotional: { type: Type.ARRAY, items: { type: Type.STRING } },
                    informational: { type: Type.ARRAY, items: { type: Type.STRING } },
                    visual: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["emotional", "informational", "visual"]
            }
        }
    });
    return parseJsonClean(response.text) || {};
};

export const getTrendingVideos = async (regionCode: string, maxResults: number, categoryId: string = '0') => {
    const params: any = {
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        regionCode,
        maxResults: maxResults.toString()
    };
    if (categoryId !== 'all' && categoryId !== '0') {
        params.videoCategoryId = categoryId;
    }
    const data = await fetchYouTube('videos', params);
    return data.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        thumbnailUrl: item.snippet.thumbnails.medium?.url,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        viewCount: parseInt(item.statistics.viewCount) || 0,
        likeCount: parseInt(item.statistics.likeCount) || 0,
        duration: parseDuration(item.contentDetails.duration),
    }));
};

export const getVideoCategories = async () => {
    const data = await fetchYouTube('videoCategories', { part: 'snippet', regionCode: 'KR' });
    return data.items.map((item: any) => ({ id: item.id, title: item.snippet.title }));
};

export const analyzeTrendsFromVideos = async (videos: any[]): Promise<TrendingKeyword[]> => {
    const ai = getClient();
    const inputData = videos.slice(0, 30).map(v => ({
        title: v.title,
        viewCount: v.viewCount
    }));
    
    const prompt = `
    Analyze the following list of trending videos (title and view count).
    Group them by common topics or keywords.
    For each trend, calculate the total views (sum of viewCount of videos in that group) and count the number of videos.
    
    Return a JSON array of 'TrendingKeyword' objects with:
    - rank (number)
    - keyword (string)
    - videoCount (number)
    - totalViews (number)
    - mainCategory (string)
    - mainChannelType (string)

    Input Data: ${JSON.stringify(inputData)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rank: { type: Type.INTEGER },
                        keyword: { type: Type.STRING },
                        videoCount: { type: Type.INTEGER },
                        totalViews: { type: Type.INTEGER },
                        mainCategory: { type: Type.STRING },
                        mainChannelType: { type: Type.STRING }
                    }
                }
            }
        }
    });
    const parsed = parseJsonClean(response.text);
    return Array.isArray(parsed) ? parsed : [];
};

export const analyzeRisingCreators = async (videos: any[]): Promise<RisingCreator[]> => {
    const ai = getClient();
    const inputData = videos.slice(0, 30).map(v => ({
        name: v.channelTitle,
        id: v.channelId,
        views: v.viewCount,
        thumb: v.thumbnailUrl 
    }));

    const prompt = `
    Identify rising creators from this list.
    Return a JSON array of 'RisingCreator' objects.
    IMPORTANT: You MUST preserve the exact 'channelId' (as id) and 'thumbnailUrl' (as thumb) from the input for the selected creators.
    
    Output format:
    - rank (number)
    - name (string)
    - videoCount (number of trending videos in this list)
    - channelId (string - from input id)
    - thumbnailUrl (string - from input thumb)

    Input Data: ${JSON.stringify(inputData)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        rank: { type: Type.INTEGER },
                        name: { type: Type.STRING },
                        videoCount: { type: Type.INTEGER },
                        channelId: { type: Type.STRING },
                        thumbnailUrl: { type: Type.STRING }
                    }
                }
            }
        }
    });
    const parsed = parseJsonClean(response.text);
    return Array.isArray(parsed) ? parsed : [];
};

export const fetchGoogleTrends = async (): Promise<GoogleTrendItem[]> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "What are the current daily trending searches in South Korea today? Return a JSON array matching GoogleTrendItem interface with rank, keyword, searchVolume (approx), relatedQueries.",
        config: { 
            tools: [{ googleSearch: {} }],
        }
    });
    const parsed = parseJsonClean(response.text);
    return Array.isArray(parsed) ? parsed : [];
};

export const analyzeKeywordVolume = async (keyword: string): Promise<KeywordAnalysisResult> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the keyword "${keyword}" for YouTube. Estimate search volumes and related keywords. Return JSON matching KeywordAnalysisResult.`,
        config: { responseMimeType: 'application/json' }
    });
    return parseJsonClean(response.text) || {};
};

export const generateKeywordStrategyAnalysis = async (keyword: string): Promise<StrategyResult> => {
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    const prompt = `
    ${activeInstruction.content}
    Create a YouTube channel strategy based on the keyword "${keyword}". Return JSON matching StrategyResult.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    
    const result = parseJsonClean(response.text) || {};
    return {
        ...defaultStrategy,
        ...result,
        initialStrategy: { ...defaultStrategy.initialStrategy, ...(result.initialStrategy || {}) },
        detailedPlan: { ...defaultStrategy.detailedPlan, ...(result.detailedPlan || {}) },
        suggestedTitles: { ...defaultStrategy.suggestedTitles, ...(result.suggestedTitles || {}) },
        kpiSettings: { ...defaultStrategy.kpiSettings, ...(result.kpiSettings || {}) },
        riskManagement: { ...defaultStrategy.riskManagement, ...(result.riskManagement || {}) },
        revenueModel: { ...defaultStrategy.revenueModel, ...(result.revenueModel || {}) },
    };
};

export const analyzeThumbnail = async (base64Image: string, mimeType: string): Promise<ThumbnailAnalysisResult> => {
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    
    const prompt = `
    ${activeInstruction.content}
    
    [Task]
    이 유튜브 썸네일을 전문 컨설턴트의 시각에서 정밀 분석해주세요.

    [Output Format]
    오직 아래의 JSON 포맷으로만 응답하세요 (Markdown 코드 블록 없이 Raw JSON):
    {
        "overallScore": number (0-100),
        "scores": {
            "visibility": number (0-100), // 시인성
            "curiosity": number (0-100), // 호기심
            "textReadability": number (0-100), // 텍스트 가독성
            "design": number (0-100) // 디자인 균형
        },
        "feedback": {
            "strengths": ["한글 문장", "한글 문장", "한글 문장"],
            "weaknesses": ["한글 문장", "한글 문장", "한글 문장"],
            "improvements": ["한글 문장", "한글 문장", "한글 문장"]
        }
    }
    
    [필수 요구사항]
    1. **언어**: 피드백 내용(strengths, weaknesses, improvements)은 **무조건 한국어**로 작성되어야 합니다. 절대 영어를 사용하지 마세요.
    2. **내용**: 시각적 계층 구조, 텍스트 대비, 감정적 후킹 요소를 기반으로 구체적이고 실질적인 조언을 제공하세요.
    3. **데이터**: 각 피드백 배열에는 최소 2개 이상의 항목이 포함되어야 합니다.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Image } },
                { text: prompt }
            ]
        },
        config: { 
            responseMimeType: 'application/json',
            // Add safety settings to prevent blocking
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
            ]
        }
    });
    
    if (!response.text) {
        throw new Error("AI가 이미지를 분석하지 못했습니다. (응답 없음)");
    }

    const result = parseJsonClean(response.text) || {};
    
    // Case-insensitive helper to handle potential AI key capitalization mismatches
    const getScoreValue = (obj: any, key: string) => {
       if (!obj) return 0;
       const foundKey = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
       if (!foundKey) return 0;
       
       const val = obj[foundKey];
       if (typeof val === 'number') return val;
       if (typeof val === 'string') {
           const match = val.match(/\d+/);
           return match ? Number(match[0]) : 0;
       }
       return 0;
    };

    const rawScores = result.scores || {};
    
    // Strict Sanitization
    const safeScores = {
        visibility: getScoreValue(rawScores, 'visibility'),
        curiosity: getScoreValue(rawScores, 'curiosity'),
        textReadability: getScoreValue(rawScores, 'textReadability') || getScoreValue(rawScores, 'readability'),
        design: getScoreValue(rawScores, 'design') || getScoreValue(rawScores, 'composition'),
    };

    // FORCE Calculation of Overall Score to prevent "0 Score" bug
    const calculatedSum = safeScores.visibility + safeScores.curiosity + safeScores.textReadability + safeScores.design;
    const calculatedAverage = Math.round(calculatedSum / 4);
    
    const finalOverallScore = calculatedAverage > 0 ? calculatedAverage : (Number(result.overallScore) || 0);

    const defaultStrengths = ["이미지가 선명합니다.", "주제가 명확하게 보입니다."];
    const defaultWeaknesses = ["텍스트 가독성을 더 높일 수 있습니다.", "배경과 오브젝트의 대비가 부족할 수 있습니다."];
    const defaultImprovements = ["텍스트에 외곽선을 추가해보세요.", "채도를 높여 시선을 끌어보세요."];

    return {
        ...defaultThumbnailAnalysis,
        ...result,
        overallScore: finalOverallScore,
        scores: safeScores,
        feedback: { 
            strengths: (Array.isArray(result.feedback?.strengths) && result.feedback.strengths.length > 0) ? result.feedback.strengths : defaultStrengths,
            weaknesses: (Array.isArray(result.feedback?.weaknesses) && result.feedback.weaknesses.length > 0) ? result.feedback.weaknesses : defaultWeaknesses,
            improvements: (Array.isArray(result.feedback?.improvements) && result.feedback.improvements.length > 0) ? result.feedback.improvements : defaultImprovements
        }
    };
};

export const getVideoComments = async (videoId: string, maxResults: number) => {
    const data = await fetchYouTube('commentThreads', { part: 'snippet', videoId, maxResults: maxResults.toString() });
    return data.items.map((item: any) => item.snippet.topLevelComment.snippet.textDisplay);
};

export const analyzeCommentSentiment = async (comments: string[]): Promise<CommentAnalysisResult> => {
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    const prompt = `
    ${activeInstruction.content}
    Analyze sentiments of these comments. 
    Return JSON matching CommentAnalysisResult (sentiment counts, keywords, summary). 
    Comments: ${JSON.stringify(comments)}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    sentiment: {
                        type: Type.OBJECT,
                        properties: {
                            positive: { type: Type.NUMBER },
                            negative: { type: Type.NUMBER },
                            neutral: { type: Type.NUMBER },
                        },
                        required: ["positive", "negative", "neutral"]
                    },
                    keywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    summary: {
                        type: Type.OBJECT,
                        properties: {
                            pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                            cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                            oneLine: { type: Type.STRING }
                        },
                        required: ["pros", "cons", "oneLine"]
                    }
                },
                required: ["sentiment", "keywords", "summary"]
            }
        }
    });
    
    const result = parseJsonClean(response.text) || {};
    return {
        ...defaultCommentAnalysis,
        ...result,
        keywords: Array.isArray(result.keywords) ? result.keywords : [],
        summary: {
            ...defaultCommentAnalysis.summary,
            ...(result.summary || {}),
            pros: Array.isArray(result.summary?.pros) ? result.summary.pros : [],
            cons: Array.isArray(result.summary?.cons) ? result.summary.cons : []
        }
    };
};

export const compareChannels = async (idA: string, idB: string): Promise<ChannelBattleResult> => {
    const [channelA, channelB] = await Promise.all([findChannel(idA), findChannel(idB)]);
    const ai = getClient();
    const activeInstruction = getActiveInstruction();
    const prompt = `
    ${activeInstruction.content}
    Compare these two channels and determine a winner based on stats. Return JSON matching ChannelBattleResult.
    Channel A: ${JSON.stringify(channelA)}
    Channel B: ${JSON.stringify(channelB)}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
    });
    const result = parseJsonClean(response.text) || {};
    result.channelA = channelA;
    result.channelB = channelB;
    return result;
};

export const generateShortsScript = async (keyword: string, genre: string): Promise<GeneratedShortsScript[]> => {
    const ai = getClient();
    const instruction = getActiveInstruction();
    
    const genreGuides: Record<string, string> = {
        '기본': '주제에 맞춰 가장 몰입도 높고 조회수가 잘 나올만한 구성. 3초 안에 시선을 사로잡는 강력한 후킹 필수.',
        '시니어건강': '따뜻하고 부드러운 설명형 톤. 시니어 층이 공감할 만한 무릎/허리 통증, 건강 조언 등을 주제로 위로와 정보를 함께 제공.',
        '국뽕': '강한 자극형 후킹으로 시작. 한국의 기술, 문화, 시민의식에 대한 자부심이 폭발하도록 작성. 벅차오르는 감정 유도.',
        '해외반응': '외국인이 한국을 보고 놀라거나 극찬하는 리얼한 반응 묘사. "한국인만 모르는 한국의 위엄" 같은 뉘앙스.',
        '스토리형': '첫 문장부터 강렬한 반전이나 갈등으로 시작. 실수->깨달음, 오해->화해 등 기승전결이 있는 서사. 감정 이입 유도.',
        '시니어감성': '인생을 회상하거나 부모님 세대가 깊이 공감할 수 있는 잔잔한 감성. 그리움, 후회, 사랑 등의 키워드 활용.',
        '쇼핑전환형': '일상의 불편함이나 문제 제기로 시작해 자연스럽게 해결책(제품/서비스)이 등장하는 흐름. 광고 같지 않게 정보성으로 접근하여 구매 욕구 자극.'
    };

    const specificGuide = genreGuides[genre] || genreGuides['기본'];
    
    const prompt = `
    [System Persona]
    ${instruction.content}

    [Task]
    주제: "${keyword}"
    장르/스타일: "${genre}"

    [Genre Guideline]
    ${specificGuide}

    [Requirements]
    1. 위 주제와 가이드라인을 바탕으로 유튜브 쇼츠 대본 5개를 작성해주세요.
    2. 반드시 **한국어(Korean)**로 작성해야 합니다.
    3. **핵심 요구사항: 각 대본의 본문(Body)은 공백 포함 500자 이상 900자 이하로 내용을 풍부하게 작성해야 합니다.** 짧게 쓰지 마세요.

    [Output Structure]
    1. Title: 클릭을 유도하는 자극적인 제목.
    2. Hook: 첫 3초 안에 시청자를 사로잡을 강렬한 멘트나 상황 설정.
    3. Body: 지루할 틈 없는 본문 내용 (정보나 스토리를 구체적으로 풀어서 500~900자 분량 확보).
    4. Ending: 구독/좋아요 유도 또는 반전 결말, 여운 남기기.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Shorts title" },
                        hook: { type: Type.STRING, description: "3-second hook" },
                        body: { type: Type.STRING, description: "Main content (500-900 chars)" },
                        ending: { type: Type.STRING, description: "Ending or CTA" }
                    },
                    required: ["title", "hook", "body", "ending"]
                }
            }
        }
    });
    
    const parsed = parseJsonClean(response.text);
    return Array.isArray(parsed) ? parsed : [];
};

export const analyzeVideosByKeyword = async (
    keyword: string, 
    maxResults: number, 
    categoryId: string, 
    duration: string, 
    onProgress: (count: number) => void
): Promise<AnalyzedVideo[]> => {
    let allVideos: any[] = [];
    let pageToken = '';
    let totalFetched = 0;
    
    // Safety limit to prevent infinite loops (max 500 or user limit + buffer)
    const safetyLimit = Math.min(maxResults + 50, 500); 

    try {
        while (totalFetched < maxResults) {
            const searchParams: any = { 
                part: 'snippet', 
                q: keyword, 
                type: 'video', 
                maxResults: '50', // Max allowed per request
                pageToken: pageToken
            };
            
            if (categoryId !== '0') searchParams.videoCategoryId = categoryId;
            if (duration !== 'any') searchParams.videoDuration = duration;

            const searchData = await fetchYouTube('search', searchParams);
            
            if (!searchData.items || searchData.items.length === 0) break;

            const videoIds = searchData.items.map((i: any) => i.id.videoId).join(',');
            const vData = await fetchYouTube('videos', { part: 'snippet,statistics,contentDetails', id: videoIds });
            
            allVideos = [...allVideos, ...vData.items];
            totalFetched += vData.items.length;
            onProgress(Math.min(totalFetched, maxResults));

            if (!searchData.nextPageToken || totalFetched >= safetyLimit) break;
            pageToken = searchData.nextPageToken;
        }
    } catch (e) {
        console.error("Video Fetch Error", e);
        // Continue with what we have if partial fail
    }

    // Limit to requested amount and map
    const finalVideos = allVideos.slice(0, maxResults);

    return finalVideos.map((item: any) => {
        const stats = item.statistics;
        const dur = parseDuration(item.contentDetails.duration);
        const viewCount = parseInt(stats.viewCount || '0');
        const likeCount = parseInt(stats.likeCount || '0');
        const commentCount = parseInt(stats.commentCount || '0');
        const popularityScore = Math.min((viewCount / 10000) * 0.6 + (likeCount / 100) * 0.3 + (commentCount / 10) * 0.1, 100);

        return {
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnailUrl: item.snippet.thumbnails.high?.url,
            tags: item.snippet.tags || [],
            hashtags: [],
            duration: dur,
            videoType: dur <= 60 ? 'short' : 'regular',
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle,
            viewCount,
            likeCount,
            commentCount,
            popularityScore
        };
    });
};

export const generateTrendInsightReport = async (): Promise<TrendInsightResult> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "Generate a trend insight report for today in Korea (Naver/Google trends). Return JSON matching TrendInsightResult.",
        config: { 
            tools: [{ googleSearch: {} }],
        }
    });
    
    const result = parseJsonClean(response.text) || {};
    return {
        naver: Array.isArray(result.naver) ? result.naver : [],
        google: Array.isArray(result.google) ? result.google : []
    };
};

export const generateAIImage = async (prompt: string, aspectRatio: string): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: prompt }]
        }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image generated");
};

export const editAIImage = async (base64Image: string, prompt: string): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image } },
                { text: prompt }
            ]
        }
    });
    
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No edited image returned");
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text }] },
        config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            }
        }
    });
    
    if (response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
        return response.candidates[0].content.parts[0].inlineData.data;
    }
    throw new Error("No audio generated");
};

export const fetchNews = async (category: string): Promise<{items: NewsItem[], referenceDate: string}> => {
    try {
        const ai = getClient();
        const now = new Date();
        const timeString = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
        
        const categoryMap: Record<string, string> = {
            'General': '종합',
            'Politics': '정치',
            'Economy': '경제',
            'Society': '사회',
            'IT/Science': 'IT/과학',
            'Entertainment': '연예'
        };
        const krCategory = categoryMap[category] || category;

        const prompt = `
        [Context]
        Current Time (KST): ${timeString}
        Task: Search for the top 30 real-time news headlines in South Korea for the category: "${krCategory}".
        Source Preference: Naver News (네이버 뉴스), Major Korean Media.

        [Requirements]
        1. Fetch exactly 30 news items.
        2. The content MUST be in **Korean (Hangul)**. Do not output English.
        3. "rank" must be sequential from 1 to 30.

        [Output JSON Structure]
        Return ONLY a raw JSON object (no markdown) with the following structure:
        {
            "referenceDate": "YYYY년 MM월 DD일 HH:mm 기준",
            "items": [
                {
                    "rank": 1,
                    "title": "기사 제목",
                    "press": "언론사명",
                    "time": "송고 시간",
                    "url": "기사 링크 (없으면 빈 문자열)"
                }
            ]
        }
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                tools: [{ googleSearch: {} }],
                // Removed responseMimeType to fix API error
            }
        });
        
        if (!response.text) return { items: [], referenceDate: '' };

        const result = parseJsonClean(response.text);
        return { 
            items: Array.isArray(result?.items) ? result.items : [], 
            referenceDate: result?.referenceDate || '' 
        };
    } catch (e) {
        console.error("fetchNews Error", e);
        return { items: [], referenceDate: '' };
    }
};
