import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, FileText } from 'lucide-react';

interface OutlineEntry {
  id: string;
  chapterNumber: number | null;
  sceneNumber: number | null;
  summary: string;
  sortOrder: number;
}

export function OutlinePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [entries, setEntries] = useState<OutlineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<OutlineEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [summary, setSummary] = useState('');

  const loadEntries = useCallback(async () => {
    if (!bookId) return;
    try {
      const data = await api.get<OutlineEntry[]>(`/outline/by-book/${bookId}`);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load outline:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleCreate = async () => {
    if (!bookId || !summary) return;
    await api.post('/outline', { bookId, summary });
    setSummary('');
    setIsCreating(false);
    loadEntries();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    await api.put(`/outline/${editing.id}`, { summary });
    setEditing(null);
    setSummary('');
    loadEntries();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить пункт конспекта?')) return;
    await api.delete(`/outline/${id}`);
    loadEntries();
  };

  if (loading) return <div className="p-8 text-gray-400">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Конспект</h2>
        <div className="flex-1" />
        <button onClick={() => { setIsCreating(true); setSummary(''); }} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={14} /> Добавить
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {(isCreating || editing) && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              placeholder="Краткое содержание сцены/части..."
            />
            <div className="flex gap-2 mt-3">
              <button onClick={editing ? handleUpdate : handleCreate} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                {editing ? 'Сохранить' : 'Добавить'}
              </button>
              <button onClick={() => { setIsCreating(false); setEditing(null); setSummary(''); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">
                Отмена
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Конспект пуст</p>
            <p className="text-sm mt-1">Составьте план книги</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={entry.id} className="flex items-start gap-3 bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300">
                <span className="text-sm font-medium text-gray-400 mt-0.5">{index + 1}.</span>
                <p className="flex-1 text-sm text-gray-700">{entry.summary}</p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => { setEditing(entry); setSummary(entry.summary); }} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
