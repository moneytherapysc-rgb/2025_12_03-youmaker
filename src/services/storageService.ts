
import type { HistoryItem, Folder, FavoriteItem, Notice } from '../types';

const HISTORY_KEY = 'yt_macgyver_history';
const FOLDERS_KEY = 'yt_macgyver_folders';
const FAVORITES_KEY = 'yt_macgyver_favorites';
const NOTICES_KEY = 'yt_macgyver_notices';

// Helper for safe JSON parsing
const safeParse = <T>(key: string, fallback: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (!stored) return fallback;
        return JSON.parse(stored);
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        localStorage.removeItem(key); // Clear corrupt data to self-heal
        return fallback;
    }
};

// --- History Management ---

export const getHistory = (): HistoryItem[] => {
    return safeParse<HistoryItem[]>(HISTORY_KEY, []);
};

export const addToHistory = (item: Omit<HistoryItem, 'timestamp' | 'id'>) => {
    let history = getHistory();
    // Remove duplicate if exists (move to top)
    history = history.filter(h => !(h.type === item.type && h.value === item.value));
    
    const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: Date.now()
    };
    
    // Add to beginning, limit to 50 items
    history.unshift(newItem);
    if (history.length > 50) history.pop();
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

export const removeHistoryItem = (id: string) => {
    let history = getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

// --- Folders Management ---

export const getFolders = (): Folder[] => {
    return safeParse<Folder[]>(FOLDERS_KEY, []);
};

export const createFolder = (name: string) => {
    const folders = getFolders();
    const newFolder: Folder = {
        id: Date.now().toString(),
        name,
        createdAt: Date.now()
    };
    folders.push(newFolder);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
};

export const updateFolderName = (id: string, newName: string) => {
    const folders = getFolders();
    const updated = folders.map(f => f.id === id ? { ...f, name: newName } : f);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
};

export const deleteFolder = (id: string) => {
    let folders = getFolders();
    folders = folders.filter(f => f.id !== id);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    
    // Delete favorites associated with deleted folder
    let favorites = getFavorites();
    favorites = favorites.filter(f => f.folderId !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

// --- Favorites Management ---

export const getFavorites = (folderId?: string): FavoriteItem[] => {
    const allFavorites = safeParse<FavoriteItem[]>(FAVORITES_KEY, []);
    if (folderId === 'all') return allFavorites;
    if (folderId) return allFavorites.filter(f => f.folderId === folderId);
    return allFavorites;
};

export const addToFavorites = (item: Omit<FavoriteItem, 'id' | 'createdAt'>) => {
    const favorites = getFavorites('all');
    // Check duplication
    if (favorites.some(f => f.type === item.type && f.value === item.value)) {
        return; // Already exists
    }
    
    const newItem: FavoriteItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: Date.now()
    };
    
    favorites.push(newItem);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const removeFromFavorites = (id: string) => {
    let favorites = getFavorites('all');
    favorites = favorites.filter(f => f.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const removeFromFavoritesByValue = (type: 'channel' | 'keyword' | 'video', value: string) => {
    let favorites = getFavorites('all');
    favorites = favorites.filter(f => !(f.type === type && f.value === value));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

export const moveFavorite = (id: string, newFolderId: string) => {
    const favorites = getFavorites('all');
    const updated = favorites.map(f => f.id === id ? { ...f, folderId: newFolderId } : f);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
};

export const isFavorite = (type: 'channel' | 'keyword' | 'video', value: string): boolean => {
    const favorites = getFavorites('all');
    return favorites.some(f => f.type === type && f.value === value);
};

// --- Notice Management ---

export const getNotices = (): Notice[] => {
    return safeParse<Notice[]>(NOTICES_KEY, [
        {
            id: 'notice-1',
            title: '🎉 유메이커 정식 서비스 오픈 안내',
            content: '안녕하세요, 크리에이터 여러분!\n유튜브 데이터 분석 솔루션 [유메이커]가 정식 오픈했습니다.\n\n유메이커는 채널 성장 분석, 키워드 발굴, 숏폼 기획 등 유튜브 운영에 필요한 핵심 기능을 AI와 결합하여 제공합니다.\n이제 데이터에 기반한 전략적인 채널 운영을 시작해보세요!\n\n[주요 기능]\n- 원클릭 채널/키워드 분석\n- AI 성장 전략 리포트\n- 쇼츠 아이디어 및 대본 생성\n- AI 썸네일 클리닉',
            createdAt: new Date().toISOString(),
            author: '관리자'
        },
        {
            id: 'notice-3',
            title: '🔑 YouTube API 키 발급 가이드 (필독)',
            content: '유메이커는 Google 공식 YouTube Data API v3를 사용하여 데이터를 분석합니다.\n원활한 서비스 이용을 위해 사용자 본인의 API 키 발급을 권장드립니다.\n\n[발급 방법 요약]\n1. Google Cloud Console 접속\n2. 새 프로젝트 생성\n3. "YouTube Data API v3" 라이브러리 사용 설정\n4. 사용자 인증 정보(API Key) 생성\n\n자세한 내용은 좌측 메뉴의 "사용 가이드"를 참고해주세요.',
            createdAt: new Date().toISOString(),
            author: '관리자'
        },
        {
            id: 'notice-5',
            title: '💰 요금제 및 환불 규정 안내',
            content: '유메이커는 합리적인 가격으로 최고의 AI 기능을 제공합니다.\n\n- 오픈 특가: 월 9,900원 (선착순 500명)\n- 스타터 플랜: 월 18,900원\n\n* 결제 후 7일 이내에 서비스 사용 이력이 없는 경우 전액 환불 가능합니다.\n* 환불 문의는 고객센터 채널을 이용해주세요.',
            createdAt: new Date().toISOString(),
            author: '관리자'
        }
    ]);
};

export const addNotice = (title: string, content: string, author: string) => {
    const notices = getNotices();
    const newNotice: Notice = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        author
    };
    localStorage.setItem(NOTICES_KEY, JSON.stringify([newNotice, ...notices]));
};

export const updateNotice = (id: string, title: string, content: string) => {
    const notices = getNotices();
    const updated = notices.map(n => n.id === id ? { ...n, title, content } : n);
    localStorage.setItem(NOTICES_KEY, JSON.stringify(updated));
};

export const deleteNotice = (id: string) => {
    const notices = getNotices();
    const updated = notices.filter(n => n.id !== id);
    localStorage.setItem(NOTICES_KEY, JSON.stringify(updated));
};
