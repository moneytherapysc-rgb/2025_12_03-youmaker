
import React, { useState, useEffect } from 'react';
import { getHistory, clearHistory, removeHistoryItem, getFolders, createFolder, deleteFolder, getFavorites, removeFromFavorites, moveFavorite, updateFolderName } from '../services/storageService';
import type { HistoryItem, Folder, FavoriteItem } from '../types';
import { FolderIcon, FolderOpenIcon, BookmarkIcon, TrashIcon, PlusIcon, ChartBarIcon, SearchIcon, CheckCircleIcon, PlayIcon, PencilIcon, CheckIcon, XMarkIcon } from './icons';

interface MyLibraryViewProps {
    onNavigate: (view: 'channel' | 'keyword_analysis', data: string) => void;
}

const MyLibraryView: React.FC<MyLibraryViewProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'favorites' | 'history'>('favorites');
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [movingItemId, setMovingItemId] = useState<string | null>(null);
    
    // Editing state
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [editFolderName, setEditFolderName] = useState('');

    useEffect(() => {
        loadData();
    }, [activeTab, selectedFolderId]);

    const loadData = () => {
        setFolders(getFolders());
        if (activeTab === 'favorites') {
            setFavorites(getFavorites(selectedFolderId));
        } else {
            setHistory(getHistory());
        }
    };

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            createFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
            loadData();
        }
    };

    const startEditing = (folder: Folder) => {
        setEditingFolderId(folder.id);
        setEditFolderName(folder.name);
    };

    const saveFolderRename = () => {
        if (editingFolderId && editFolderName.trim()) {
            updateFolderName(editingFolderId, editFolderName.trim());
            setEditingFolderId(null);
            loadData();
        }
    };

    const handleDeleteFolder = (id: string) => {
        if (window.confirm('폴더를 삭제하시겠습니까? 포함된 즐겨찾기도 함께 삭제됩니다.')) {
            deleteFolder(id);
            if (selectedFolderId === id) setSelectedFolderId('all');
            loadData();
        }
    };

    const handleMoveItem = (itemId: string, targetFolderId: string) => {
        moveFavorite(itemId, targetFolderId);
        setMovingItemId(null);
        loadData();
    };

    const handleRemoveFavorite = (id: string) => {
        if (window.confirm('즐겨찾기에서 삭제하시겠습니까?')) {
            removeFromFavorites(id);
            loadData();
        }
    };

    const handleClearHistory = () => {
        if (window.confirm('분석 기록을 모두 삭제하시겠습니까?')) {
            clearHistory();
            loadData();
        }
    };

    const handleHistoryClick = (item: HistoryItem) => {
        if (item.type === 'channel') {
            onNavigate('channel', item.value);
        } else if (item.type === 'keyword') {
            onNavigate('keyword_analysis', item.value);
        }
    };

    const handleFavoriteClick = (item: FavoriteItem) => {
        if (item.type === 'channel') {
            onNavigate('channel', item.value);
        } else if (item.type === 'keyword') {
            onNavigate('keyword_analysis', item.value);
        } else if (item.type === 'video') {
            window.open(`https://www.youtube.com/watch?v=${item.value}`, '_blank');
        }
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'channel': return <ChartBarIcon className="w-6 h-6" />;
            case 'keyword': return <SearchIcon className="w-6 h-6" />;
            case 'video': return <PlayIcon className="w-6 h-6" />;
            default: return <SearchIcon className="w-6 h-6" />;
        }
    };

    const getItemTypeLabel = (type: string) => {
        switch (type) {
            case 'channel': return '채널';
            case 'keyword': return '키워드';
            case 'video': return '영상';
            default: return '기타';
        }
    };

    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    const isCustomFolder = selectedFolderId !== 'all' && selectedFolderId !== 'uncategorized';

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden font-sans">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <BookmarkIcon className="w-7 h-7 text-indigo-500" />
                    마이 라이브러리
                </h2>
                <div className="flex gap-2 bg-white dark:bg-slate-700 p-1 rounded-lg border border-slate-200 dark:border-slate-600">
                    <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'favorites' ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                    >
                        즐겨찾기
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'history' ? 'bg-indigo-500 text-white shadow' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                    >
                        분석 기록
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar (Folders) - Only visible in Favorites tab */}
                {activeTab === 'favorites' && (
                    <div className="w-64 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="p-4">
                            <button
                                onClick={() => setIsCreatingFolder(true)}
                                className="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors text-sm font-semibold"
                            >
                                <PlusIcon className="w-4 h-4" /> 새 폴더 만들기
                            </button>
                            
                            {isCreatingFolder && (
                                <form onSubmit={handleCreateFolder} className="mt-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                                        placeholder="폴더명 입력"
                                        className="w-full px-3 py-2 text-sm border border-indigo-500 rounded-lg outline-none dark:bg-slate-700 dark:text-white"
                                    />
                                </form>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-2 space-y-1">
                            <button
                                onClick={() => setSelectedFolderId('all')}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${selectedFolderId === 'all' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <FolderOpenIcon className={`w-5 h-5 ${selectedFolderId === 'all' ? 'text-indigo-500' : 'text-slate-400'}`} />
                                전체 보기
                            </button>
                            <button
                                onClick={() => setSelectedFolderId('uncategorized')}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${selectedFolderId === 'uncategorized' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                            >
                                <FolderIcon className={`w-5 h-5 ${selectedFolderId === 'uncategorized' ? 'text-indigo-500' : 'text-slate-400'}`} />
                                미분류
                            </button>
                            <div className="border-t border-slate-200 dark:border-slate-700 my-2 mx-2"></div>
                            {folders.map(folder => (
                                <div key={folder.id}>
                                    {editingFolderId === folder.id ? (
                                        <form onSubmit={(e) => { e.preventDefault(); saveFolderRename(); }} className="flex items-center gap-1 px-2 py-1">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editFolderName}
                                                onChange={(e) => setEditFolderName(e.target.value)}
                                                className="flex-1 min-w-0 px-2 py-1 text-sm border border-indigo-500 rounded outline-none dark:bg-slate-700 dark:text-white"
                                            />
                                            <button type="submit" className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900 rounded"><CheckIcon className="w-4 h-4" /></button>
                                            <button type="button" onClick={() => setEditingFolderId(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><XMarkIcon className="w-4 h-4" /></button>
                                        </form>
                                    ) : (
                                        <div className="group relative flex items-center">
                                            <button
                                                onClick={() => setSelectedFolderId(folder.id)}
                                                className={`flex-1 text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${selectedFolderId === folder.id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                            >
                                                <FolderIcon className={`w-5 h-5 ${selectedFolderId === folder.id ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                <span className="truncate">{folder.name}</span>
                                            </button>
                                            <div className="absolute right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-800 pl-1">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); startEditing(folder); }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="폴더 이름 수정"
                                                >
                                                    <PencilIcon className="w-3.5 h-3.5"/>
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    title="폴더 삭제"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5"/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-transparent">
                    {activeTab === 'favorites' ? (
                        <>
                            <div className="flex justify-between items-end mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 flex-1">
                                    {editingFolderId === selectedFolderId && isCustomFolder ? (
                                         <form onSubmit={(e) => { e.preventDefault(); saveFolderRename(); }} className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editFolderName}
                                                onChange={(e) => setEditFolderName(e.target.value)}
                                                className="text-lg font-bold border border-indigo-500 rounded px-2 py-1 outline-none bg-white dark:bg-slate-700 dark:text-white w-full max-w-xs"
                                            />
                                            <button type="submit" className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded transition-colors"><CheckIcon className="w-5 h-5" /></button>
                                            <button type="button" onClick={() => setEditingFolderId(null)} className="p-1.5 text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded transition-colors"><XMarkIcon className="w-5 h-5" /></button>
                                        </form>
                                    ) : (
                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 group">
                                            {selectedFolderId === 'all' ? '전체 즐겨찾기' : selectedFolderId === 'uncategorized' ? '미분류 항목' : selectedFolder?.name}
                                            <span className="text-sm font-normal text-slate-500">({favorites.length})</span>
                                            {isCustomFolder && selectedFolder && (
                                                <button 
                                                    onClick={() => startEditing(selectedFolder)}
                                                    className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    title="폴더명 수정"
                                                >
                                                    <PencilIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </h3>
                                    )}
                                </div>
                                
                                {isCustomFolder && (
                                     <button onClick={() => handleDeleteFolder(selectedFolderId)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <TrashIcon className="w-3.5 h-3.5" /> 폴더 삭제
                                    </button>
                                )}
                            </div>
                            
                            {favorites.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-slate-300 dark:text-slate-600 mb-4">
                                        <BookmarkIcon className="w-16 h-16 mx-auto" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">즐겨찾기 목록이 비어있습니다.</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                                        관심 있는 채널이나 키워드를 분석한 후,<br/>
                                        상단의 <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-xs font-bold mx-1"><BookmarkIcon className="w-3 h-3 mr-1"/>즐겨찾기</span> 버튼을 눌러 저장해보세요.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <button 
                                            onClick={() => onNavigate('channel', '')}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md"
                                        >
                                            <ChartBarIcon /> 채널 분석하러 가기
                                        </button>
                                        <button 
                                            onClick={() => onNavigate('keyword_analysis', '')}
                                            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-md"
                                        >
                                            <SearchIcon /> 키워드 분석하러 가기
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {favorites.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 p-4 hover:shadow-md transition-shadow relative group">
                                            <div className="flex items-start gap-3 cursor-pointer" onClick={() => handleFavoriteClick(item)}>
                                                {item.thumbnailUrl ? (
                                                    <img src={item.thumbnailUrl} alt={item.title} className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-600" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                                                        {getItemIcon(item.type)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm mb-0.5">{item.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{getItemTypeLabel(item.type)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setMovingItemId(movingItemId === item.id ? null : item.id); }}
                                                    className="p-1.5 bg-slate-100 dark:bg-slate-600 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-slate-500 dark:text-slate-300 hover:text-indigo-600 rounded-full transition-colors"
                                                    title="폴더 이동"
                                                >
                                                    <FolderIcon className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(item.id); }}
                                                    className="p-1.5 bg-slate-100 dark:bg-slate-600 hover:bg-red-100 dark:hover:bg-red-900 text-slate-500 dark:text-slate-300 hover:text-red-600 rounded-full transition-colors"
                                                    title="삭제"
                                                >
                                                    <TrashIcon className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {movingItemId === item.id && (
                                                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-600 z-10 p-1">
                                                    <p className="text-xs font-bold text-slate-500 px-2 py-1">이동할 폴더 선택</p>
                                                    <button onClick={() => handleMoveItem(item.id, 'uncategorized')} className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded">미분류</button>
                                                    {folders.map(f => (
                                                        <button key={f.id} onClick={() => handleMoveItem(item.id, f.id)} className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 rounded truncate">
                                                            {f.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">최근 분석 기록</h3>
                                {history.length > 0 && (
                                    <button onClick={handleClearHistory} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                                        <TrashIcon className="w-3.5 h-3.5" /> 기록 삭제
                                    </button>
                                )}
                            </div>
                            
                            {history.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <p>최근 분석한 기록이 없습니다.</p>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {history.map(item => (
                                            <li key={item.id} className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group" onClick={() => handleHistoryClick(item)}>
                                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mr-4 text-slate-500 dark:text-slate-400">
                                                    {getItemIcon(item.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{item.title}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                        {getItemTypeLabel(item.type)} 분석
                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                        {new Date(item.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); removeHistoryItem(item.id); loadData(); }} 
                                                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyLibraryView;
