import { useState, useRef, useEffect } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface FindReplaceProps {
  onReplace: (search: string, replace: string) => void;
  onClose: () => void;
}

export function FindReplace({ onReplace, onClose }: FindReplaceProps) {
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showReplace && replace) {
        onReplace(search, replace);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Найти..."
        className="flex-1 max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {showReplace && (
        <>
          <input
            type="text"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Заменить на..."
            className="flex-1 max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => search && onReplace(search, replace)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Заменить
          </button>
        </>
      )}

      <button
        onClick={() => setShowReplace(!showReplace)}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
        title={showReplace ? 'Скрыть замену' : 'Показать замену'}
      >
        {showReplace ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <button
        onClick={onClose}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
      >
        <X size={14} />
      </button>
    </div>
  );
}
