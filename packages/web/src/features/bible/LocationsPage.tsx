import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';
import { ENTITY_TYPE_COLORS } from '@literary-studio/shared';

interface Location {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  scope: string;
  status: string;
}

export function LocationsPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Location | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadLocations = useCallback(async () => {
    if (!seriesId) return;
    try {
      const data = await api.get<Location[]>(`/locations/by-series/${seriesId}`);
      setLocations(data);
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleCreate = async (data: Partial<Location>) => {
    if (!seriesId) return;
    try {
      await api.post('/locations', { seriesId, ...data });
      loadLocations();
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create location:', err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Location>) => {
    try {
      await api.put(`/locations/${id}`, data);
      loadLocations();
      setEditing(null);
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить локацию?')) return;
    try {
      await api.delete(`/locations/${id}`);
      loadLocations();
    } catch (err) {
      console.error('Failed to delete location:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Локации</h2>
        <Badge variant="default">{locations.length}</Badge>
        <div className="flex-1" />
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={14} />
          Новая локация
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {locations.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <MapPin size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Нет локаций</p>
            <p className="text-sm mt-1">Создайте первую локацию</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: ENTITY_TYPE_COLORS.location }}
                    >
                      <MapPin size={14} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{loc.name}</h3>
                      {loc.category && (
                        <p className="text-xs text-gray-500">{loc.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(loc)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {loc.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {loc.description}
                  </p>
                )}

                <div className="mt-3">
                  <Badge variant={loc.status === 'approved' ? 'final' : 'draft'}>
                    {loc.scope === 'series' ? 'Серия' : 'Локальная'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isCreating || editing) && (
        <LocationForm
          location={editing}
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

function LocationForm({
  location,
  onSave,
  onClose,
}: {
  location: Location | null;
  onSave: (data: Partial<Location>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(location?.name || '');
  const [category, setCategory] = useState(location?.category || '');
  const [description, setDescription] = useState(location?.description || '');
  const [scope, setScope] = useState(location?.scope || 'series');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, description, scope });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {location ? 'Редактировать локацию' : 'Новая локация'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Город, Здание, Планета..."
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
              {location ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
