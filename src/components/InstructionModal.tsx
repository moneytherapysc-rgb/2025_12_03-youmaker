
import React, { useState, useEffect } from 'react';
import { BrainIcon, PencilIcon, CheckCircleIcon } from './icons';
import { getInstructions, setActiveInstruction, addInstruction, updateInstruction, deleteInstruction } from '../services/instructionService';
import type { SystemInstruction } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const [instructions, setInstructions] = useState<SystemInstruction[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [view, setView] = useState<'list' | 'edit'>('list');

  useEffect(() => {
    if (isOpen) {
      loadInstructions();
      setView('list');
    }
  }, [isOpen]);

  const loadInstructions = () => {
    setInstructions(getInstructions());
  };

  const handleActivate = (id: string) => {
    setActiveInstruction(id);
    loadInstructions();
  };

  const handleEdit = (instruction: SystemInstruction) => {
    setEditingId(instruction.id);
    setName(instruction.name);
    setContent(instruction.content);
    setView('edit');
  };

  const handleAdd = () => {
    setEditingId(null);
    setName('');
    setContent('');
    setView('edit');
  };

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;

    if (editingId) {
      updateInstruction(editingId, name, content);
    } else {
      addInstruction(name, content);
    }
    loadInstructions();
    setView('list');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      deleteInstruction(id);
      loadInstructions();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg max-w-2xl w-full text-left border-t-4 border-purple-500 relative animate-fade-in-up max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BrainIcon className="w-7 h-7 text-purple-500" />
                AI 지침(페르소나) 설정
            </h2>
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
            &times;
            </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-1">
            {view === 'list' ? (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        AI가 분석할 때 사용할 성격과 어조를 선택하세요. 선택된 지침은 모든 분석 및 스크립트 생성에 적용됩니다.
                    </p>
                    
                    <div className="grid gap-4">
                        {instructions.map((inst) => (
                            <div 
                                key={inst.id} 
                                onClick={() => handleActivate(inst.id)}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                                    inst.isActive 
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className={`font-bold text-lg ${inst.isActive ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {inst.name}
                                        </h3>
                                        {inst.isActive && <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                                    </div>
                                    
                                    {/* 관리자만 수정/삭제 버튼 노출 */}
                                    {isAdmin && (
                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button 
                                                onClick={() => handleEdit(inst)}
                                                className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <PencilIcon className="w-4 h-4"/>
                                            </button>
                                            {inst.id !== 'default' && (
                                                <button 
                                                    onClick={() => handleDelete(inst.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <i className="fas fa-trash w-4 h-4"></i>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                    {inst.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {isAdmin ? (
                        <button 
                            onClick={handleAdd}
                            className="w-full py-3 mt-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 font-semibold hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-plus"></i> 새로운 지침 추가하기
                        </button>
                    ) : (
                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
                            * AI 지침의 추가 및 수정은 관리자 권한이 필요합니다.
                        </p>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">지침 이름 (페르소나)</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 친절한 설명봇"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">지침 내용 (시스템 프롬프트)</label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            placeholder="AI에게 부여할 역할과 어조를 구체적으로 적어주세요.&#13;&#10;예: 당신은 10년차 유튜브 컨설턴트입니다. 친근한 말투로 초보자도 이해하기 쉽게 설명해주세요."
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500 leading-relaxed"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button 
                            onClick={() => setView('list')}
                            className="flex-1 py-3 font-bold text-slate-600 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            취소
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={!name.trim() || !content.trim()}
                            className="flex-1 py-3 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            저장하기
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default InstructionModal;
