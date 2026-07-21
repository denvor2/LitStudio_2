import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';
import { CODEX_ENTRY_COLORS, CODEX_ENTRY_TYPE_LABELS, CODEX_ENTRY_TYPES } from '@literary-studio/shared';

interface CodexEntry {
  id: string;
  type: string;
  name: string;
  attributes: Record<string, unknown>;
  scope: string;
  status: string;
}

export function CodexPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [entries, setEntries] = useState<CodexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editing, setEditing] = useState<CodexEntry | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!projectId) return;
    try {
      const query = filter !== 'all' ? `?type=${filter}` : '';
      const data = await api.get<CodexEntry[]>(`/codex/by-project/${projectId}${query}`);
      setEntries(data);
    } catch (err) {
      console.error('Failed to load codex:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId, filter]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  const handleCreate = async (data: Partial<CodexEntry>) => {
    if (!projectId) return;
    await api.post('/codex', { projectId, ...data });
    loadEntries();
    setIsCreating(false);
  };

  const handleUpdate = async (id: string, data: Partial<CodexEntry>) => {
    await api.put(`/codex/${id}`, data);
    loadEntries();
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить сущность?')) return;
    await api.delete(`/codex/${id}`);
    loadEntries();
  };

  if (loading) return <div className="p-8 text-gray-400">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Кодекс</h2>
        <Badge variant="default">{entries.length}</Badge>
        <div className="flex-1" />
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded ${filter === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            Все
          </button>
          {CODEX_ENTRY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2 py-1 text-xs rounded ${filter === type ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
            >
              {CODEX_ENTRY_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={14} /> Новая сущность
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {entries.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">Кодекс пуст</p>
            <p className="text-sm mt-1">Добавьте персонажей, локации и другие сущности</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: CODEX_ENTRY_COLORS[entry.type] || '#64748b' }}>
                      {entry.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.name}</h3>
                      <p className="text-xs text-gray-500">{CODEX_ENTRY_TYPE_LABELS[entry.type] || entry.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button onClick={() => setEditing(entry)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(entry.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400"><Trash2 size={14} /></button>
                  </div>
                </div>
                {typeof entry.attributes.description === 'string' && entry.attributes.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">{entry.attributes.description}</p>
                )}
                <div className="mt-3">
                  <Badge variant={entry.status === 'approved' ? 'final' : 'draft'}>
                    {entry.scope === 'series' ? 'Серия' : 'Локальная'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isCreating || editing) && (
        <CodexEntryForm
          entry={editing}
          onSave={editing ? (data) => handleUpdate(editing.id, data) : handleCreate}
          onClose={() => { setIsCreating(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function CodexEntryForm({ entry, onSave, onClose }: {
  entry: CodexEntry | null;
  onSave: (data: Partial<CodexEntry>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState(entry?.type || 'character');
  const [name, setName] = useState(entry?.name || '');
  const [description, setDescription] = useState(String(entry?.attributes?.description || ''));
  const [scope, setScope] = useState(entry?.scope || 'series');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ type, name, attributes: { description }, scope });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{entry ? 'Редактировать' : 'Новая сущность'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип *</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              {CODEX_ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>{CODEX_ENTRY_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="series">Серия</option>
              <option value="local">Локальная</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">{entry ? 'Сохранить' : 'Создать'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
