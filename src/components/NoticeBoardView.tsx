import React, { useState, useEffect } from 'react';
import { getNotices, addNotice, updateNotice, deleteNotice } from '../services/storageService';
import type { Notice } from '../types';
import { MegaphoneIcon, PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon } from './icons';
import { useAuth } from '../contexts/AuthContext';

const NoticeBoardView: React.FC = () => {
    const { isAdmin, user } = useAuth();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'detail' | 'write' | 'edit'>('list');
    const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
    
    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    useEffect(() => {
        loadNotices();
    }, []);

    const loadNotices = () => {
        const data = getNotices();
        setNotices(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };

    const handleWriteClick = () => {
        setTitle('');
        setContent('');
        setViewMode('write');
    };

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        if (viewMode === 'edit' && selectedNotice) {
            updateNotice(selectedNotice.id, title, content);
            setSelectedNotice({ ...selectedNotice, title, content }); // Update local state for detail view
            setViewMode('detail');
        } else {
            addNotice(title, content, user?.name || '관리자');
            setViewMode('list');
        }
        loadNotices();
    };

    const handleNoticeClick = (notice: Notice) => {
        setSelectedNotice(notice);
        setViewMode('detail');
    };

    const handleEditClick = () => {
        if (!selectedNotice) return;
        setTitle(selectedNotice.title);
        setContent(selectedNotice.content);
        setViewMode('edit');
    };

    const handleDeleteClick = () => {
        if (!selectedNotice) return;
        if (window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) {
            deleteNotice(selectedNotice.id);
            loadNotices();
            setViewMode('list');
        }
    };

    const handleBack = () => {
        setViewMode('list');
        setSelectedNotice(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="max-w-5xl mx-auto font-sans animate-fade-in-up pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg mb-8 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <MegaphoneIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-1">
                                공지사항
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400">
                                유메이커의 새로운 소식과 업데이트를 확인하세요.
                            </p>
                        </div>
                    </div>
                    {isAdmin && viewMode === 'list' && (
                        <button 
                            onClick={handleWriteClick}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5" /> 글쓰기
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
                
                {/* List View */}
                {viewMode === 'list' && (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {notices.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                                등록된 공지사항이 없습니다.
                            </div>
                        ) : (
                            notices.map((notice) => (
                                <div 
                                    key={notice.id} 
                                    onClick={() => handleNoticeClick(notice)}
                                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {notice.title}
                                        </h3>
                                        <span className="text-sm text-slate-400 whitespace-nowrap ml-4">
                                            {formatDate(notice.createdAt)}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">
                                        {notice.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Detail View */}
                {viewMode === 'detail' && selectedNotice && (
                    <div className="p-8">
                        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {selectedNotice.title}
                                </h2>
                                <div className="text-sm text-slate-500 dark:text-slate-400 flex gap-4">
                                    <span>{formatDate(selectedNotice.createdAt)}</span>
                                    <span>작성자: {selectedNotice.author}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {isAdmin && (
                                    <>
                                        <button 
                                            onClick={handleEditClick}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title="수정"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={handleDeleteClick}
                                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="삭제"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={handleBack}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-semibold text-sm"
                                >
                                    목록으로
                                </button>
                            </div>
                        </div>
                        
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed min-h-[300px]">
                            {selectedNotice.content}
                        </div>
                    </div>
                )}

                {/* Write/Edit View */}
                {(viewMode === 'write' || viewMode === 'edit') && (
                    <div className="p-8">
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">제목</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="공지사항 제목을 입력하세요"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:text-white text-lg"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">내용</label>
                            <textarea 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="공지사항 내용을 입력하세요..."
                                rows={15}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 dark:text-white leading-relaxed"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={handleBack}
                                className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-bold"
                            >
                                취소
                            </button>
                            <button 
                                onClick={handleSave}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors font-bold flex items-center gap-2"
                            >
                                <CheckIcon className="w-5 h-5" />
                                {viewMode === 'write' ? '등록하기' : '수정 완료'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
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

export default NoticeBoardView;