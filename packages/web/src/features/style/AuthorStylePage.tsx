import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Trash2, Palette } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';

interface StopListEntry {
  id: string;
  phrase: string;
  suggestion: string | null;
  example: string | null;
}

interface AuthorStyle {
  id: string;
  pov: string | null;
  tonality: string | null;
  punctuationRules: { name: string; description: string; example: string }[];
  stopList: StopListEntry[];
}

export function AuthorStylePage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [style, setStyle] = useState<AuthorStyle | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Form state
  const [pov, setPov] = useState('');
  const [tonality, setTonality] = useState('');

  // Stop list
  const [newPhrase, setNewPhrase] = useState('');
  const [newSuggestion, setNewSuggestion] = useState('');
  const [newExample, setNewExample] = useState('');

  const loadStyle = useCallback(async () => {
    if (!seriesId) return;
    try {
      const data = await api.get<AuthorStyle | null>(`/style/by-series/${seriesId}`);
      if (data) {
        setStyle(data);
        setPov(data.pov || '');
        setTonality(data.tonality || '');
      }
    } catch (err) {
      console.error('Failed to load style:', err);
    } finally {
      setLoading(false);
    }
  }, [seriesId]);

  useEffect(() => {
    loadStyle();
  }, [loadStyle]);

  const handleSaveStyle = async () => {
    if (!seriesId) return;
    try {
      await api.put(`/style/by-series/${seriesId}`, { pov, tonality });
      loadStyle();
      setEditing(false);
    } catch (err) {
      console.error('Failed to save style:', err);
    }
  };

  const handleAddStopListEntry = async () => {
    if (!style || !newPhrase) return;
    try {
      await api.post('/style/stop-list', {
        styleId: style.id,
        phrase: newPhrase,
        suggestion: newSuggestion || undefined,
        example: newExample || undefined,
      });
      setNewPhrase('');
      setNewSuggestion('');
      setNewExample('');
      loadStyle();
    } catch (err) {
      console.error('Failed to add stop list entry:', err);
    }
  };

  const handleDeleteStopListEntry = async (id: string) => {
    try {
      await api.delete(`/style/stop-list/${id}`);
      loadStyle();
    } catch (err) {
      console.error('Failed to delete stop list entry:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Авторский стиль</h2>
      </div>

      <div className="p-6 space-y-6 max-w-3xl">
        {/* POV & Tonality */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Основы стиля</h3>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Редактировать
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveStyle}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setPov(style?.pov || '');
                    setTonality(style?.tonality || '');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Отмена
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                POV / Время повествования
              </label>
              {editing ? (
                <input
                  type="text"
                  value={pov}
                  onChange={(e) => setPov(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Третье лицо, Прошедшее время"
                />
              ) : (
                <p className="text-sm text-gray-600">{pov || 'Не задано'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тональность повествования
              </label>
              {editing ? (
                <textarea
                  value={tonality}
                  onChange={(e) => setTonality(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Краткое описание тональности для AI-контекста"
                />
              ) : (
                <p className="text-sm text-gray-600">{tonality || 'Не задано'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stop List */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-medium text-gray-900">Стоп-лист оборотов</h3>
            {style && (
              <Badge variant="default">{style.stopList.length}</Badge>
            )}
          </div>

          {/* Add new entry */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <input
              type="text"
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Штамп (например: сердце ёкнуло)"
            />
            <input
              type="text"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Предложение по переформулировке"
            />
            <input
              type="text"
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Пример из текста (опционально)"
            />
            <button
              onClick={handleAddStopListEntry}
              disabled={!newPhrase}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              Добавить
            </button>
          </div>

          {/* List entries */}
          {style && style.stopList.length > 0 ? (
            <div className="space-y-2">
              {style.stopList.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      «{entry.phrase}»
                    </div>
                    {entry.suggestion && (
                      <div className="text-sm text-gray-600 mt-1">
                        → {entry.suggestion}
                      </div>
                    )}
                    {entry.example && (
                      <div className="text-xs text-gray-500 mt-1 italic">
                        Пример: {entry.example}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteStopListEntry(entry.id)}
                    className="p-1 rounded hover:bg-gray-200 text-gray-400 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <Palette size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Стоп-лист пуст</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
