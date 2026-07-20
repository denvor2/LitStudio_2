import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';

interface Rule {
  id: string;
  name: string;
  category: string | null;
  formulation: string;
  exceptions: string | null;
  scope: string;
  status: string;
}

export function RulesPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadRules = useCallback(async () => {
    if (!seriesId) return;
    try {
      const data = await api.get<Rule[]>(`/rules/by-series/${seriesId}`);
      setRules(data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleCreate = async (data: Partial<Rule>) => {
    if (!seriesId) return;
    try {
      await api.post('/rules', { seriesId, ...data });
      loadRules();
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to create rule:', err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Rule>) => {
    try {
      await api.put(`/rules/${id}`, data);
      loadRules();
      setEditing(null);
    } catch (err) {
      console.error('Failed to update rule:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить правило?')) return;
    try {
      await api.delete(`/rules/${id}`);
      loadRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Правила мира</h2>
        <Badge variant="default">{rules.length}</Badge>
        <div className="flex-1" />
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={14} />
          Новое правило
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {rules.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Нет правил</p>
            <p className="text-sm mt-1">Добавьте правила мира</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{rule.name}</h3>
                      {rule.category && (
                        <Badge variant="default">{rule.category}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{rule.formulation}</p>
                    {rule.exceptions && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        Исключения: {rule.exceptions}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(rule)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <Badge variant={rule.status === 'approved' ? 'final' : 'draft'}>
                    {rule.scope === 'series' ? 'Серия' : 'Локальная'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(isCreating || editing) && (
        <RuleForm
          rule={editing}
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

function RuleForm({
  rule,
  onSave,
  onClose,
}: {
  rule: Rule | null;
  onSave: (data: Partial<Rule>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [category, setCategory] = useState(rule?.category || '');
  const [formulation, setFormulation] = useState(rule?.formulation || '');
  const [exceptions, setExceptions] = useState(rule?.exceptions || '');
  const [scope, setScope] = useState(rule?.scope || 'series');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, formulation, exceptions, scope });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {rule ? 'Редактировать правило' : 'Новое правило'}
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
              placeholder="Физика, Технология, Социальное..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Формулировка *</label>
            <textarea
              value={formulation}
              onChange={(e) => setFormulation(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Исключения</label>
            <textarea
              value={exceptions}
              onChange={(e) => setExceptions(e.target.value)}
              rows={2}
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
              {rule ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
