
export type AppView = 
  | 'home' 
  | 'channel' 
  | 'script' 
  | 'trending' 
  | 'admin' 
  | 'news' 
  | 'keyword_video' 
  | 'thumbnail' 
  | 'comment_analysis' 
  | 'library' 
  | 'battle' 
  | 'shorts_generator' 
  | 'notice';

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadsPlaylistId: string;
  videoCount: number;
  publishedAt: string;
  subscriberCount: number;
  viewCount: number;
}

export interface VideoStatistics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  tags: string[]; 
  hashtags: string[];
  duration: number;
  videoType: 'short' | 'regular';
  channelId: string;
  channelTitle: string;
}

export interface AnalyzedVideo extends VideoDetails, VideoStatistics {
  popularityScore: number;
  country?: string;
}

export interface StrategyResult {
  coreConcept: {
    title: string;
    description: string;
  };
  detailedPlan: {
    contentDirection: { title: string; details: string; };
    uploadSchedule: { title: string; details: string; };
    communityEngagement: { title: string; details: string; };
    keywordStrategy: { title: string; details: string; };
  };
  initialStrategy: {
    title: string;
    phases: Array<{ phaseTitle: string; focus: string; actionItems: string[]; }>;
  };
  suggestedTitles: { title: string; titles: string[]; };
  kpiSettings: { title: string; kpis: Array<{ kpiTitle: string; description: string; }>; };
  riskManagement: { title: string; risks: Array<{ riskTitle: string; strategy: string; }>; };
  revenueModel: { title: string; streams: Array<{ revenueTitle: string; description: string; }>; };
}

export interface ChannelExtraStats {
  firstVideoDate: string;
  averageUploadIntervalAll: string;
  averageUploadIntervalRecent: string;
}

export interface GrowthPhase {
  phaseTitle: string;
  period: string;
  performanceSummary: string;
  strategyAnalysis: string;
  keyVideos: Array<{ title: string; reason: string; }>;
  quantitativeAnalysis: { title: string; avgViews: string; likeViewRatio: string; commentViewRatio: string; };
  contentStrategyAnalysis: { title: string; avgVideoDuration: string; uploadFrequency: string; titleThumbnailStrategy: string; };
}

export interface GrowthAnalysisResult {
  title: string;
  overallSummary: string;
  phases: GrowthPhase[];
}

export interface ConsultingResult {
  overallDiagnosis: { title: string; summary: string; };
  detailedAnalysis: Array<{ area: string; problem: string; solution: string; }>;
  actionPlan: {
    shortTerm: { title: string; period: string; steps: string[]; };
    longTerm: { title: string; period: string; steps: string[]; };
  };
}

export interface GeneratedScript {
  title: string;
  description: string;
  script: {
    opening: { narration: string; visual_cue: string; };
    main_points: Array<{ scene: string; narration: string; visual_cue: string; }>;
    closing: { narration: string; visual_cue: string; };
  };
}

export interface SummaryObject {
    title: string;
    coreMessage: string;
    structure: string;
    summaryPoints: string[];
}

export interface GeneratedTitles {
    fresh: string[];
    stable: string[];
}

export interface GeneratedThumbnailText {
    emotional: string[];
    informational: string[];
    visual: string[];
}

export interface TrendingKeyword {
  rank: number;
  keyword: string;
  videoCount: number;
  totalViews: number;
  mainCategory: string;
  mainChannelType: string;
}

export interface RisingCreator {
  rank: number;
  name: string;
  videoCount: number;
  channelId: string;
  thumbnailUrl: string;
}

export interface VideoCategory {
    id: string;
    title: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; 
  joinedAt: string;
  subscription?: {
    plan: 'event_launch' | '1month' | '3months' | '6months' | '12months' | 'trial';
    status: 'active' | 'expired';
    startDate: string;
    endDate: string;
  };
  isAdmin?: boolean;
}

export interface Coupon {
    id: string;
    code: string;
    durationMonths: 0.5 | 1 | 3 | 6 | 12;
    isUsed: boolean;
    createdAt: string;
    usedBy?: string;
    usedAt?: string;
}

export interface SubscriptionPlan {
    id: 'event_launch' | '1month' | '3months' | '6months' | '12months';
    name: string;
    price: number;
    durationMonths: number;
    discount?: number;
    description?: string;
}

export interface SystemInstruction {
    id: string;
    name: string;
    content: string;
    isActive: boolean;
}

export interface GoogleTrendItem {
    rank: number;
    keyword: string;
    searchVolume: string;
    growthRate: string;
    startedAt: string;
    trendStatus: string;
    relatedQueries: string[];
    graphData: number[];
}

export interface KeywordAnalysisResult {
    relatedKeywords: string[];
    volumes: Array<{ keyword: string; pcVolume: number; mobileVolume: number; totalVolume: number; }>;
}

export interface ThumbnailAnalysisResult {
  overallScore: number;
  scores: { visibility: number; curiosity: number; textReadability: number; design: number; };
  feedback: { strengths: string[]; weaknesses: string[]; improvements: string[]; };
}

export interface CommentAnalysisResult {
  sentiment: { positive: number; negative: number; neutral: number; };
  keywords: string[];
  summary: { pros: string[]; cons: string[]; oneLine: string; };
}

export interface HistoryItem {
  id: string;
  type: 'channel' | 'keyword' | 'video';
  value: string;
  title: string;
  thumbnailUrl?: string;
  timestamp: number;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

export interface FavoriteItem {
  id: string;
  folderId: string;
  type: 'channel' | 'keyword' | 'video';
  value: string;
  title: string;
  thumbnailUrl?: string;
  createdAt: number;
}

export interface BattleStats {
    subscribers: number;
    totalViews: number;
    avgViews: number;
    engagementRate: number;
    uploadFrequency: number;
    videoCount: number;
    powerScore: number;
}

export interface ChannelBattleResult {
    channelA: YouTubeChannel;
    channelB: YouTubeChannel;
    statsA: BattleStats;
    statsB: BattleStats;
    winner: 'A' | 'B' | 'Tie';
    radarData: Array<{ subject: string; A: number; B: number; fullMark: number; }>;
}

export interface ShortsIdea {
    title: string;
    hook: string;
    script: string;
    visualGuide: string;
}

// New Interface for Structured Shorts Script
export interface GeneratedShortsScript {
    title: string;
    hook: string;
    body: string;
    ending: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: string;
}

export interface TrendRankItem {
    rank: number;
    keyword: string;
    searchVolume?: string;
    status?: 'new' | 'up' | 'down' | 'same';
}

export interface TrendInsightResult {
    naver: TrendRankItem[];
    google: TrendRankItem[];
}

export interface NewsItem {
    rank: number;
    title: string;
    press: string;
    time: string;
    summary?: string;
    url?: string;
}
