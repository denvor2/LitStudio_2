import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

interface SceneStats {
  id: string;
  title: string | null;
  charCount: number;
  wordCount: number;
  status: string;
}

interface BookStats {
  totalChars: number;
  totalWords: number;
  targetChars: number | null;
  sceneCount: number;
  completedScenes: number;
  scenes: SceneStats[];
}

export function StatisticsPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [stats, setStats] = useState<BookStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!bookId) return;
    try {
      // Get book details for target
      const book = await api.get<{ targetChars: number | null }>(`/books/${bookId}`);

      // Get all chapters with scenes
      const chapters = await api.get<{ scenes: SceneStats[] }[]>(`/chapters/by-book/${bookId}`);

      const allScenes = chapters.flatMap((ch) => ch.scenes || []);
      const totalChars = allScenes.reduce((sum, s) => sum + (s.charCount || 0), 0);
      const totalWords = allScenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);
      const completedScenes = allScenes.filter((s) => s.status === 'final').length;

      setStats({
        totalChars,
        totalWords,
        targetChars: book.targetChars,
        sceneCount: allScenes.length,
        completedScenes,
        scenes: allScenes,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading || !stats) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  const progress = stats.targetChars
    ? Math.min(100, Math.round((stats.totalChars / stats.targetChars) * 100))
    : null;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Статистика</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <BarChart3 size={16} />
              Всего знаков
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {stats.totalChars.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.totalWords.toLocaleString()} слов
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <Target size={16} />
              Прогресс
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {progress !== null ? `${progress}%` : '—'}
            </div>
            {stats.targetChars && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{stats.totalChars.toLocaleString()}</span>
                  <span>{stats.targetChars.toLocaleString()}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
              <TrendingUp size={16} />
              Сцены
            </div>
            <div className="text-2xl font-semibold text-gray-900">
              {stats.completedScenes} / {stats.sceneCount}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              завершено
            </div>
          </div>
        </div>

        {/* Scene breakdown */}
        {stats.scenes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Прогресс по сценам</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.scenes.map((scene) => (
                <div key={scene.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {scene.title || 'Без названия'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {scene.charCount.toLocaleString()} знаков
                    </div>
                  </div>
                  <div className="w-32">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          scene.status === 'final'
                            ? 'bg-green-500'
                            : scene.status === 'proofread'
                            ? 'bg-blue-500'
                            : scene.status === 'editing'
                            ? 'bg-amber-500'
                            : 'bg-gray-300'
                        }`}
                        style={{
                          width: `${stats.targetChars ? Math.min(100, (scene.charCount / (stats.targetChars / stats.sceneCount)) * 100) : 50}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    scene.status === 'final'
                      ? 'bg-green-100 text-green-700'
                      : scene.status === 'proofread'
                      ? 'bg-blue-100 text-blue-700'
                      : scene.status === 'editing'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {scene.status === 'draft'
                      ? 'Черновик'
                      : scene.status === 'editing'
                      ? 'Редактура'
                      : scene.status === 'proofread'
                      ? 'Вычитано'
                      : 'Финал'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
