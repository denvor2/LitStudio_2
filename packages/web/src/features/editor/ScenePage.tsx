import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { ChapterTree } from './ChapterTree';
import { EditorToolbar } from './EditorToolbar';
import { StatsBar } from './StatsBar';
import { SceneStatus, AUTHOR_SHEET_CHARS, PAGE_CHARS } from '@literary-studio/shared';

interface SceneData {
  id: string;
  title: string | null;
  content: string;
  status: string;
  wordCount: number;
  charCount: number;
  chapterId: string;
}

export function ScenePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [activeScene, setActiveScene] = useState<SceneData | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const loadScene = useCallback(async (sceneId: string) => {
    try {
      const data = await api.get<SceneData>(`/scenes/${sceneId}`);
      setActiveScene(data);
    } catch (err) {
      console.error('Failed to load scene:', err);
    }
  }, []);

  const saveScene = useCallback(async (content: string) => {
    if (!activeScene) return;
    setSaving(true);
    try {
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const charCount = content.length;
      await api.put(`/scenes/${activeScene.id}`, { content, wordCount, charCount });
      setActiveScene((prev) => prev ? { ...prev, content, wordCount, charCount } : prev);
    } catch (err) {
      console.error('Failed to save scene:', err);
    } finally {
      setSaving(false);
    }
  }, [activeScene]);

  const handleContentChange = useCallback(
    debounce((value: string) => saveScene(value), 1000),
    [saveScene]
  );

  const handleStatusChange = async (status: SceneStatus) => {
    if (!activeScene) return;
    await api.put(`/scenes/${activeScene.id}`, { status });
    setActiveScene((prev) => prev ? { ...prev, status } : prev);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[250px] border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
        <ChapterTree
          bookId={bookId!}
          activeSceneId={activeScene?.id || null}
          onSelectScene={loadScene}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {activeScene ? (
          <>
            <EditorToolbar status={activeScene.status as SceneStatus} onStatusChange={handleStatusChange} />
            <div className="flex-1 overflow-y-auto">
              <textarea
                ref={editorRef}
                defaultValue={activeScene.content}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full px-16 py-12 focus:outline-none resize-none"
                style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '18px', lineHeight: '1.8' }}
                placeholder="Начните писать..."
              />
            </div>
            <StatsBar
              wordCount={activeScene.wordCount}
              charCount={activeScene.charCount}
              authorSheets={Math.round(activeScene.charCount / AUTHOR_SHEET_CHARS * 100) / 100}
              pages={Math.ceil(activeScene.charCount / PAGE_CHARS)}
            />
            {saving && <div className="px-4 py-1 text-xs text-gray-400 border-t border-gray-100">Сохранение...</div>}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg">Выберите сцену для редактирования</p>
              <p className="text-sm mt-1">или создайте новую главу</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }) as T;
}
