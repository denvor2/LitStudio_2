import { ChevronDown, Bold, Italic, Quote, Undo, Redo, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SceneStatus } from '@literary-studio/shared';

interface EditorToolbarProps {
  status: SceneStatus;
  onStatusChange: (status: SceneStatus) => void;
  onFindReplace?: () => void;
}

const statusOptions: { value: SceneStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Черновик', color: 'bg-gray-400' },
  { value: 'editing', label: 'На редактуре', color: 'bg-amber-500' },
  { value: 'proofread', label: 'Вычитано', color: 'bg-blue-500' },
  { value: 'final', label: 'Финал', color: 'bg-green-500' },
];

export function EditorToolbar({ status, onStatusChange, onFindReplace }: EditorToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentStatus = statusOptions.find((s) => s.value === status) || statusOptions[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
      {/* Text formatting */}
      <button
        onClick={() => document.execCommand('bold')}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Жирный (Ctrl+B)"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => document.execCommand('italic')}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Курсив (Ctrl+I)"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => document.execCommand('formatBlock', false, 'blockquote')}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Цитата"
      >
        <Quote size={16} />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Undo/Redo */}
      <button
        onClick={() => document.execCommand('undo')}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Отменить (Ctrl+Z)"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => document.execCommand('redo')}
        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
        title="Повторить (Ctrl+Y)"
      >
        <Redo size={16} />
      </button>

      <div className="flex-1" />

      {/* Find & Replace */}
      {onFindReplace && (
        <button
          onClick={onFindReplace}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          title="Найти и заменить"
        >
          <Search size={16} />
        </button>
      )}

      {/* Status dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setStatusOpen(!statusOpen)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 border border-gray-200"
        >
          <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
          <span>{currentStatus.label}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>

        {statusOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onStatusChange(option.value);
                  setStatusOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50
                  ${option.value === status ? 'bg-gray-50 font-medium' : ''}`}
              >
                <span className={`w-2 h-2 rounded-full ${option.color}`} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
