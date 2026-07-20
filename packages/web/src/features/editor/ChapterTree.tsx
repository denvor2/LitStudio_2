import { BookOpen, FileText, ChevronDown, ChevronRight, Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

interface Chapter {
  id: string;
  title: string;
  scenes: {
    id: string;
    title: string | null;
    status: string;
  }[];
}

interface ChapterTreeProps {
  chapters: Chapter[];
  activeSceneId: string | null;
  onSelectScene: (sceneId: string) => void;
  onCreateChapter: () => void;
  onCreateScene: (chapterId: string) => void;
}

const statusDot: Record<string, string> = {
  draft: 'bg-gray-400',
  editing: 'bg-amber-500',
  proofread: 'bg-blue-500',
  final: 'bg-green-500',
};

export function ChapterTree({
  chapters,
  activeSceneId,
  onSelectScene,
  onCreateChapter,
  onCreateScene,
}: ChapterTreeProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(chapters.map((c) => c.id))
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Главы и сцены
        </span>
        <button
          onClick={onCreateChapter}
          className="p-1 rounded hover:bg-gray-200 text-gray-500"
          title="Добавить главу"
        >
          <Plus size={14} />
        </button>
      </div>

      {chapters.length === 0 && (
        <div className="px-3 py-4 text-center text-sm text-gray-400">
          <BookOpen size={24} className="mx-auto mb-2 opacity-50" />
          <p>Пока нет глав</p>
          <button
            onClick={onCreateChapter}
            className="mt-2 text-blue-600 hover:underline text-xs"
          >
            Создать первую главу
          </button>
        </div>
      )}

      {chapters.map((chapter) => (
        <div key={chapter.id} className="mb-1">
          <div
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer group"
            onClick={() => toggleChapter(chapter.id)}
          >
            {expandedChapters.has(chapter.id) ? (
              <ChevronDown size={14} className="text-gray-400" />
            ) : (
              <ChevronRight size={14} className="text-gray-400" />
            )}
            <BookOpen size={14} className="text-gray-400" />
            <span className="flex-1 truncate font-medium">{chapter.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateScene(chapter.id);
              }}
              className="p-0.5 rounded hover:bg-gray-200 text-gray-400 opacity-0 group-hover:opacity-100"
              title="Добавить сцену"
            >
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
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot[scene.status] || 'bg-gray-300'}`} />
                  <FileText size={14} className="text-gray-400" />
                  <span className="flex-1 truncate">
                    {scene.title || 'Без названия'}
                  </span>
                </div>
              ))}

              {chapter.scenes.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-400">
                  Нет сцен
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
