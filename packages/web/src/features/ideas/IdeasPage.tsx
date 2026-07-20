import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, Lightbulb, Tag } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';

interface Idea {
  id: string;
  title: string | null;
  content: string | null;
  tags: string[];
  createdAt: string;
}

export function IdeasPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Idea | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const loadIdeas = useCallback(async () => {
    if (!bookId) return;
    try {
      const data = await api.get<Idea[]>(`/ideas/by-book/${bookId}`);
      setIdeas(data);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleCreate = async () => {
    if (!bookId) return;
    try {
      await api.post('/ideas', {
        bookId,
        title: title || undefined,
        content: content || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      resetForm();
      setIsCreating(false);
      loadIdeas();
    } catch (err) {
      console.error('Failed to create idea:', err);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      await api.put(`/ideas/${editing.id}`, {
        title: title || undefined,
        content: content || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      resetForm();
      setEditing(null);
      loadIdeas();
    } catch (err) {
      console.error('Failed to update idea:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить идею?')) return;
    try {
      await api.delete(`/ideas/${id}`);
      loadIdeas();
    } catch (err) {
      console.error('Failed to delete idea:', err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags('');
  };

  const startEditing = (idea: Idea) => {
    setEditing(idea);
    setTitle(idea.title || '');
    setContent(idea.content || '');
    setTags(idea.tags.join(', '));
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Идеи</h2>
        <Badge variant="default">{ideas.length}</Badge>
        <div className="flex-1" />
        <button
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={14} />
          Новая идея
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {/* Create/Edit form */}
        {(isCreating || editing) && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">
              {editing ? 'Редактировать идею' : 'Новая идея'}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Заголовок (опционально)"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="Содержание идеи..."
              />
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Теги через запятую"
              />
              <div className="flex gap-2">
                <button
                  onClick={editing ? handleUpdate : handleCreate}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editing ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditing(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ideas list */}
        {ideas.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Lightbulb size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Нет идей</p>
            <p className="text-sm mt-1">Запишите свои наброски</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white border border-gray-200 rounded-lg p-4 group hover:border-gray-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {idea.title && (
                      <h3 className="font-medium text-gray-900">{idea.title}</h3>
                    )}
                    {idea.content && (
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                        {idea.content}
                      </p>
                    )}
                    {idea.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Tag size={12} className="text-gray-400" />
                        {idea.tags.map((tag, i) => (
                          <Badge key={i} variant="default">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => startEditing(idea)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(idea.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
