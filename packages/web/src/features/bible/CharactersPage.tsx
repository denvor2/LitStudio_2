import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';
import { ENTITY_TYPE_COLORS } from '@literary-studio/shared';

interface Character {
  id: string;
  name: string;
  role: string | null;
  description: string | null;
  scope: string;
  status: string;
  nameVariants: { name: string; context: string }[];
}

export function CharactersPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Character | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadCharacters = useCallback(async () => {
    if (!seriesId) return;
    try {
      const data = await api.get<Character[]>(`/characters/by-series/${seriesId}`);
      setCharacters(data);
    } catch (err) {
      console.error('Failed to load characters:', err);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const handleCreate = async (data: Partial<Character>) => {
    if (!seriesId) return;
    try {
      await api.post('/characters', { seriesId, ...data });
      loadCharacters();
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create character:', err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Character>) => {
    try {
      await api.put(`/characters/${id}`, data);
      loadCharacters();
      setEditing(null);
    } catch (err) {
      console.error('Failed to update character:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить персонажа?')) return;
    try {
      await api.delete(`/characters/${id}`);
      loadCharacters();
    } catch (err) {
      console.error('Failed to delete character:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Персонажи</h2>
        <Badge variant="default">{characters.length}</Badge>
        <div className="flex-1" />
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={14} />
          Новый персонаж
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {characters.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <User size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Нет персонажей</p>
            <p className="text-sm mt-1">Создайте первого персонажа</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char) => (
              <div
                key={char.id}
                className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: ENTITY_TYPE_COLORS.character }}
                    >
                      {char.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{char.name}</h3>
                      {char.role && (
                        <p className="text-xs text-gray-500">{char.role}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(char)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(char.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {char.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {char.description}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3">
                  <Badge variant={char.status === 'approved' ? 'final' : 'draft'}>
                    {char.scope === 'series' ? 'Серия' : 'Локальная'}
                  </Badge>
                  {char.nameVariants.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {char.nameVariants.length} вариантов имени
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {(isCreating || editing) && (
        <CharacterForm
          character={editing}
          onSave={editing ? (data) => handleUpdate(editing.id, data) : handleCreate}
          onClose={() => {
            setIsCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function CharacterForm({
  character,
  onSave,
  onClose,
}: {
  character: Character | null;
  onSave: (data: Partial<Character>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(character?.name || '');
  const [role, setRole] = useState(character?.role || '');
  const [description, setDescription] = useState(character?.description || '');
  const [scope, setScope] = useState(character?.scope || 'series');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, role, description, scope });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {character ? 'Редактировать персонажа' : 'Новый персонаж'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Главный герой, Антагонист, и т.д."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="series">Серия</option>
              <option value="local">Локальная</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {character ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
