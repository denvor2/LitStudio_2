import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Plus, FileText, ChevronDown, ChevronRight, BookOpen } from 'lucide-react';

interface Beat {
  id: string;
  title: string | null;
  description: string | null;
  sortOrder: number;
}

interface Scene {
  id: string;
  title: string | null;
  status: string;
  wordCount: number;
  charCount: number;
  beats: Beat[];
}

interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
}

interface ChapterTreeProps {
  bookId: string;
  activeSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onRefresh: () => void;
}

const statusDot: Record<string, string> = {
  draft: 'bg-gray-400',
  editing: 'bg-amber-500',
  proofread: 'bg-blue-500',
  final: 'bg-green-500',
};

export function ChapterTree({ bookId, activeSceneId, onSelectScene, onRefresh }: ChapterTreeProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  const loadChapters = useCallback(async () => {
    try {
      const data = await api.get<Chapter[]>(`/chapters/by-book/${bookId}`);
      setChapters(data);
      setExpandedChapters(new Set(data.map((c) => c.id)));
    } catch (err) {
      console.error('Failed to load chapters:', err);
    }
  }, [bookId]);

  useEffect(() => { loadChapters(); }, [loadChapters]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreateChapter = async () => {
    const title = prompt('Название главы:');
    if (!title) return;
    await api.post('/chapters', { bookId, title });
    loadChapters();
    onRefresh();
  };

  const handleCreateScene = async (chapterId: string) => {
    const scene = await api.post<{ id: string }>('/scenes', { chapterId });
    loadChapters();
    onSelectScene(scene.id);
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Главы и сцены</span>
        <button onClick={handleCreateChapter} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400" title="Добавить главу">
          <Plus size={14} />
        </button>
      </div>

      {chapters.length === 0 && (
        <div className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
          <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
          <p>Пока нет глав</p>
          <button onClick={handleCreateChapter} className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-xs">Создать первую главу</button>
        </div>
      )}

      {chapters.map((chapter) => (
        <div key={chapter.id} className="mb-1">
          <div
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer group"
            onClick={() => toggleChapter(chapter.id)}
          >
            {expandedChapters.has(chapter.id) ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            <BookOpen size={14} className="text-gray-400" />
            <span className="flex-1 truncate font-medium">{chapter.title}</span>
            <button onClick={(e) => { e.stopPropagation(); handleCreateScene(chapter.id); }} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100" title="Добавить сцену">
              <Plus size={12} />
            </button>
          </div>

          {expandedChapters.has(chapter.id) && (
            <div className="ml-6">
              {chapter.scenes.map((scene) => (
                <div
                  key={scene.id}
                  onClick={() => onSelectScene(scene.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer
                    ${scene.id === activeSceneId
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[scene.status] || 'bg-gray-300'}`} />
                  <FileText size={14} className="text-gray-400" />
                  <span className="flex-1 truncate">{scene.title || 'Без названия'}</span>
                  <span className="text-xs text-gray-400">{scene.wordCount.toLocaleString()} сл.</span>
                </div>
              ))}
              {chapter.scenes.length === 0 && <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">Нет сцен</div>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
