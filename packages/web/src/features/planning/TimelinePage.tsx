import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Trash2, Clock } from 'lucide-react';

interface TimelineEventData {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  relativeTime: string | null;
  sceneId: string | null;
  sortOrder: number;
}

export function TimelinePage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [events, setEvents] = useState<TimelineEventData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!bookId) return;
    try {
      const data = await api.get<TimelineEventData[]>(`/timeline/by-book/${bookId}`);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleAddEvent = async () => {
    const title = prompt('Название события:');
    if (!title || !bookId) return;
    const eventDate = prompt('Дата (например: "3 дня спустя"):');
    await api.post('/timeline', { bookId, title, eventDate: eventDate || undefined });
    loadEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    await api.delete(`/timeline/${id}`);
    loadEvents();
  };

  if (loading) return <div className="p-8 text-gray-400">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Таймлайн</h2>
        <div className="flex-1" />
        <button onClick={handleAddEvent} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={14} /> Событие
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {events.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Clock size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">Таймлайн пуст</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="relative flex items-start gap-4 pl-10">
                  <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                  <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{event.title}</h3>
                        {(event.eventDate || event.relativeTime) && (
                          <p className="text-sm text-gray-500 mt-1">{event.eventDate || event.relativeTime}</p>
                        )}
                      </div>
                      <button onClick={() => handleDeleteEvent(event.id)} className="p-1 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
