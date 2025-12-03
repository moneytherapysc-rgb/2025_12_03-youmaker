
import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, placeholder }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className="relative flex items-center group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "유튜브 채널 이름 또는 ID를 입력하세요..."}
          className="w-full pl-6 pr-16 py-4 text-lg bg-white dark:bg-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all placeholder:text-slate-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-2 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:bg-slate-400 transition-transform active:scale-95 shadow-md flex items-center justify-center aspect-square"
          disabled={isLoading}
          style={{ height: 'calc(100% - 16px)' }}
        >
          <SearchIcon className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
