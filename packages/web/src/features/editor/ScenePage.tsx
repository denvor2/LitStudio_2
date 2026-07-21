import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { ChapterTree } from './ChapterTree';
import { EditorToolbar } from './EditorToolbar';
import { StatsBar } from './StatsBar';
import { SceneEditor } from './SceneEditor';
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

  const loadScene = useCallback(async (sceneId: string) => {
    try {
      const data = await api.get<SceneData>(`/scenes/${sceneId}`);
      setActiveScene(data);
    } catch (err) {
      console.error('Failed to load scene:', err);
    }
  }, []);

  const saveScene = useCallback(async (content: string, wordCount: number, charCount: number) => {
    if (!activeScene) return;
    setSaving(true);
    try {
      await api.put(`/scenes/${activeScene.id}`, { content, wordCount, charCount });
      setActiveScene((prev) => prev ? { ...prev, content, wordCount, charCount } : prev);
    } catch (err) {
      console.error('Failed to save scene:', err);
    } finally {
      setSaving(false);
    }
  }, [activeScene]);

  const handleEditorUpdate = useCallback(
    debounce((content: string, wordCount: number, charCount: number) => {
      saveScene(content, wordCount, charCount);
    }, 2000),
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
      <div className="w-[250px] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1b1e] overflow-y-auto flex-shrink-0">
        <ChapterTree
          bookId={bookId!}
          activeSceneId={activeScene?.id || null}
          onSelectScene={loadScene}
          onRefresh={() => setRefreshKey((k) => k + 1)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
        {activeScene ? (
          <>
            <EditorToolbar status={activeScene.status as SceneStatus} onStatusChange={handleStatusChange} />
            <SceneEditor
              sceneId={activeScene.id}
              initialContent={activeScene.content || ''}
              onUpdate={handleEditorUpdate}
            />
            <StatsBar
              wordCount={activeScene.wordCount}
              charCount={activeScene.charCount}
              authorSheets={Math.round(activeScene.charCount / AUTHOR_SHEET_CHARS * 100) / 100}
              pages={Math.ceil(activeScene.charCount / PAGE_CHARS)}
            />
            {saving && <div className="px-4 py-1 text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-800">Сохранение...</div>}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500">
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
