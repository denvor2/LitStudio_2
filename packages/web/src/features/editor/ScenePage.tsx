import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { SceneEditor } from './SceneEditor';
import { EditorToolbar } from './EditorToolbar';
import { ChapterTree } from './ChapterTree';
import { StatsBar } from './StatsBar';
import { FindReplace } from './FindReplace';
import { SceneStatus } from '@literary-studio/shared';

interface Chapter {
  id: string;
  title: string;
  scenes: { id: string; title: string | null; status: string }[];
}

interface SceneData {
  id: string;
  title: string | null;
  content: string;
  contentPlaintext: string | null;
  charCount: number;
  wordCount: number;
  status: string;
  chapterId: string;
}

export function ScenePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeScene, setActiveScene] = useState<SceneData | null>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load chapters
  const loadChapters = useCallback(async () => {
    if (!bookId) return;
    try {
      const data = await api.get<Chapter[]>(`/chapters/by-book/${bookId}`);
      setChapters(data);
    } catch (err) {
      console.error('Failed to load chapters:', err);
    }
  }, [bookId]);

  // Load scene
  const loadScene = useCallback(async (sceneId: string) => {
    try {
      const data = await api.get<SceneData>(`/scenes/${sceneId}`);
      setActiveScene(data);
    } catch (err) {
      console.error('Failed to load scene:', err);
    }
  }, []);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // Auto-save
  const saveScene = useCallback(async (content: string, plaintext: string) => {
    if (!activeScene) return;
    setSaving(true);
    try {
      await api.put(`/scenes/${activeScene.id}`, {
        content: JSON.parse(content),
        contentPlaintext: plaintext,
      });
      setActiveScene((prev) =>
        prev
          ? { ...prev, content, contentPlaintext: plaintext }
          : prev
      );
    } catch (err) {
      console.error('Failed to save scene:', err);
    } finally {
      setSaving(false);
    }
  }, [activeScene]);

  // Handle content update with debounce
  const handleContentUpdate = useCallback(
    debounce((content: string, plaintext: string) => {
      saveScene(content, plaintext);
    }, 1000),
    [saveScene]
  );

  // Status change
  const handleStatusChange = async (status: SceneStatus) => {
    if (!activeScene) return;
    try {
      await api.put(`/scenes/${activeScene.id}`, { status });
      setActiveScene((prev) => (prev ? { ...prev, status } : prev));
      loadChapters(); // Refresh tree to show new status
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Create chapter
  const handleCreateChapter = async () => {
    if (!bookId) return;
    const title = prompt('Название главы:');
    if (!title) return;
    try {
      await api.post('/chapters', { bookId, title });
      loadChapters();
    } catch (err) {
      console.error('Failed to create chapter:', err);
    }
  };

  // Create scene
  const handleCreateScene = async (chapterId: string) => {
    try {
      const scene = await api.post<{ id: string }>('/scenes', { chapterId });
      loadChapters();
      loadScene(scene.id);
    } catch (err) {
      console.error('Failed to create scene:', err);
    }
  };

  // Find & Replace
  const handleFindReplace = (search: string, replace: string) => {
    if (!activeScene) return;
    const newContent = activeScene.contentPlaintext?.replace(
      new RegExp(search, 'gi'),
      replace
    );
    if (newContent !== undefined) {
      saveScene(JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: newContent }] }] }), newContent);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar - chapter tree */}
      <div className="w-[250px] border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
        <ChapterTree
          chapters={chapters}
          activeSceneId={activeScene?.id || null}
          onSelectScene={loadScene}
          onCreateChapter={handleCreateChapter}
          onCreateScene={handleCreateScene}
        />
      </div>

      {/* Main editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeScene ? (
          <>
            {/* Toolbar */}
            <EditorToolbar
              status={activeScene.status as SceneStatus}
              onStatusChange={handleStatusChange}
              onFindReplace={() => setShowFindReplace(!showFindReplace)}
            />

            {/* Find & Replace */}
            {showFindReplace && (
              <FindReplace
                onReplace={handleFindReplace}
                onClose={() => setShowFindReplace(false)}
              />
            )}

            {/* Editor */}
            <div className="flex-1 overflow-y-auto">
              <SceneEditor
                content={activeScene.content}
                onUpdate={handleContentUpdate}
              />
            </div>

            {/* Stats bar */}
            <StatsBar
              charCount={activeScene.charCount}
              wordCount={activeScene.wordCount}
              targetChars={null}
            />

            {/* Save indicator */}
            {saving && (
              <div className="px-4 py-1 text-xs text-gray-400 border-t border-gray-100">
                Сохранение...
              </div>
            )}
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

// Simple debounce utility
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}
