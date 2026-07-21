import { useState } from 'react';
import { ChevronDown, Bold, Italic, Quote, Undo, Redo, Maximize, Minimize, MessageSquare } from 'lucide-react';
import { SceneStatus } from '@literary-studio/shared';

interface EditorToolbarProps {
  status: SceneStatus;
  onStatusChange: (status: SceneStatus) => void;
  onToggleComments?: () => void;
  commentsOpen?: boolean;
}

const statusOptions: { value: SceneStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Черновик', color: 'bg-gray-400' },
  { value: 'editing', label: 'На редактуре', color: 'bg-amber-500' },
  { value: 'proofread', label: 'Вычитано', color: 'bg-blue-500' },
  { value: 'final', label: 'Финал', color: 'bg-green-500' },
];

export function EditorToolbar({ status, onStatusChange, onToggleComments, commentsOpen }: EditorToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const currentStatus = statusOptions.find((s) => s.value === status) || statusOptions[0];

  const toggleZenMode = () => {
    setZenMode(!zenMode);
    if (!zenMode) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <button onClick={() => document.execCommand('bold')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Жирный">
        <Bold size={16} />
      </button>
      <button onClick={() => document.execCommand('italic')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Курсив">
        <Italic size={16} />
      </button>
      <button onClick={() => document.execCommand('formatBlock', false, 'blockquote')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Цитата">
        <Quote size={16} />
      </button>
      <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
      <button onClick={() => document.execCommand('undo')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Отменить">
        <Undo size={16} />
      </button>
      <button onClick={() => document.execCommand('redo')} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Повторить">
        <Redo size={16} />
      </button>
      <div className="flex-1" />
      <button onClick={toggleZenMode} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400" title="Режим письма">
        {zenMode ? <Minimize size={16} /> : <Maximize size={16} />}
      </button>
      {onToggleComments && (
        <button
          onClick={onToggleComments}
          className={`p-1.5 rounded ${commentsOpen ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
          title="Комментарии"
        >
          <MessageSquare size={16} />
        </button>
      )}
      <div className="relative">
        <button onClick={() => setStatusOpen(!statusOpen)} className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
          <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
          <span>{currentStatus.label}</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        {statusOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1">
            {statusOptions.map((option) => (
              <button key={option.value} onClick={() => { onStatusChange(option.value); setStatusOpen(false); }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700
                  ${option.value === status ? 'bg-gray-50 dark:bg-gray-700 font-medium' : ''}
                  ${option.value === status ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
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
