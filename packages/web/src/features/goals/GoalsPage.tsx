import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Trash2, Target, Flame, Calendar } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';
import { GOAL_TYPE_LABELS, NANO_DAILY_GOAL } from '@literary-studio/shared';

interface Goal {
  id: string;
  type: string;
  targetWords: number;
  deadline: string | null;
  currentWords: number;
  streak: number;
}

export function GoalsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [type, setType] = useState('daily');
  const [targetWords, setTargetWords] = useState(String(NANO_DAILY_GOAL));

  const loadGoals = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await api.get<Goal[]>(`/goals/by-project/${projectId}`);
      setGoals(data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const handleCreate = async () => {
    if (!projectId) return;
    await api.post('/goals', { projectId, type, targetWords: Number(targetWords) });
    setIsCreating(false);
    loadGoals();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить цель?')) return;
    await api.delete(`/goals/${id}`);
    loadGoals();
  };

  if (loading) return <div className="p-8 text-gray-400">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Цели и прогресс</h2>
      </div>

      <div className="p-6 space-y-6 max-w-3xl">
        {/* NaNoWriMo widget */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} />
            <h3 className="font-semibold">NaNoWriMo</h3>
          </div>
          <p className="text-sm opacity-90">Дневная цель: {NANO_DAILY_GOAL.toLocaleString()} слов</p>
          <p className="text-sm opacity-90">Месяц: 50,000 слов</p>
        </div>

        {/* Goals list */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Мои цели</h3>
            <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus size={14} /> Новая цель
            </button>
          </div>

          {isCreating && (
            <div className="p-4 border-b border-gray-200 bg-gray-50 space-y-3">
              <div className="flex gap-3">
                <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="daily">Дневная</option>
                  <option value="weekly">Недельная</option>
                  <option value="deadline">Дедлайн</option>
                </select>
                <input type="number" value={targetWords} onChange={(e) => setTargetWords(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" placeholder="Цель в словах" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleCreate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Создать</button>
                <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Отмена</button>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {goals.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Target size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Нет целей</p>
              </div>
            ) : (
              goals.map((goal) => {
                const progress = Math.min(100, Math.round((goal.currentWords / goal.targetWords) * 100));
                return (
                  <div key={goal.id} className="flex items-center gap-4 px-4 py-4 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{GOAL_TYPE_LABELS[goal.type]}</span>
                        {goal.streak > 0 && (
                          <Badge variant="final">
                            <Flame size={10} className="mr-1" />
                            {goal.streak} дн.
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {goal.currentWords.toLocaleString()} / {goal.targetWords.toLocaleString()} слов
                      </div>
                      <div className="mt-2">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                      {progress}%
                    </span>
                    <button onClick={() => handleDelete(goal.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
