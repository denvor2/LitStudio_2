import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, BookMarked } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';

interface Term {
  id: string;
  term: string;
  definition: string;
  synonyms: string[];
  category: string | null;
  scope: string;
  status: string;
}

export function TermsPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Term | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadTerms = useCallback(async () => {
    if (!seriesId) return;
    try {
      const data = await api.get<Term[]>(`/terms/by-series/${seriesId}`);
      setTerms(data);
    } catch (err) {
      console.error('Failed to load terms:', err);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const handleCreate = async (data: Partial<Term>) => {
    if (!seriesId) return;
    try {
      await api.post('/terms', { seriesId, ...data });
      loadTerms();
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create term:', err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Term>) => {
    try {
      await api.put(`/terms/${id}`, data);
      loadTerms();
      setEditing(null);
    } catch (err) {
      console.error('Failed to update term:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить термин?')) return;
    try {
      await api.delete(`/terms/${id}`);
      loadTerms();
    } catch (err) {
      console.error('Failed to delete term:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Термины</h2>
        <Badge variant="default">{terms.length}</Badge>
        <div className="flex-1" />
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={14} />
          Новый термин
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {terms.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <BookMarked size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Нет терминов</p>
            <p className="text-sm mt-1">Создайте глоссарий</p>
          </div>
        ) : (
          <div className="space-y-3">
            {terms.map((term) => (
              <div
                key={term.id}
                className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{term.term}</h3>
                      {term.category && (
                        <Badge variant="default">{term.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{term.definition}</p>
                    {term.synonyms.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-xs text-gray-500">Синонимы:</span>
                        {term.synonyms.map((syn, i) => (
                          <Badge key={i} variant="default">{syn}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(term)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(term.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant={term.status === 'approved' ? 'final' : 'draft'}>
                    {term.scope === 'series' ? 'Серия' : 'Локальная'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isCreating || editing) && (
        <TermForm
          term={editing}
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

function TermForm({
  term,
  onSave,
  onClose,
}: {
  term: Term | null;
  onSave: (data: Partial<Term>) => void;
  onClose: () => void;
}) {
  const [termName, setTermName] = useState(term?.term || '');
  const [definition, setDefinition] = useState(term?.definition || '');
  const [synonyms, setSynonyms] = useState(term?.synonyms.join(', ') || '');
  const [category, setCategory] = useState(term?.category || '');
  const [scope, setScope] = useState(term?.scope || 'series');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      term: termName,
      definition,
      synonyms: synonyms.split(',').map((s) => s.trim()).filter(Boolean),
      category,
      scope,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {term ? 'Редактировать термин' : 'Новый термин'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Термин *</label>
            <input
              type="text"
              value={termName}
              onChange={(e) => setTermName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Определение *</label>
            <textarea
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Синонимы</label>
            <input
              type="text"
              value={synonyms}
              onChange={(e) => setSynonyms(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Через запятую"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Технология, Организация, Понятие..."
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
              {term ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
