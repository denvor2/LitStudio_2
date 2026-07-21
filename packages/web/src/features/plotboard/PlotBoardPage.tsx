import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Badge } from '../../shared/ui/Badge';
import { CODEX_ENTRY_COLORS, CODEX_ENTRY_TYPE_LABELS } from '@literary-studio/shared';

interface PlotArc {
  id: string;
  title: string;
  color: string | null;
  sortOrder: number;
}

interface PlotCard {
  id: string;
  arcId: string;
  sceneId: string | null;
  title: string;
  description: string | null;
  sortOrder: number;
  color: string | null;
  scene?: { id: string; title: string | null; status: string } | null;
}

export function PlotBoardPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [arcs, setArcs] = useState<PlotArc[]>([]);
  const [cards, setCards] = useState<PlotCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!bookId) return;
    try {
      const data = await api.get<{ arcs: PlotArc[]; cards: PlotCard[] }>(`/plot-board/by-book/${bookId}`);
      setArcs(data.arcs);
      setCards(data.cards);
    } catch (err) {
      console.error('Failed to load plot board:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { loadBoard(); }, [loadBoard]);

  const handleAddArc = async () => {
    const title = prompt('Название колонки:');
    if (!title || !bookId) return;
    await api.post('/plot-board/arcs', { bookId, title });
    loadBoard();
  };

  const handleDeleteArc = async (id: string) => {
    if (!confirm('Удалить колонку и все карточки?')) return;
    await api.delete(`/plot-board/arcs/${id}`);
    loadBoard();
  };

  const handleAddCard = async (arcId: string) => {
    const title = prompt('Название карточки:');
    if (!title) return;
    await api.post('/plot-board/cards', { arcId, title });
    loadBoard();
  };

  const handleDeleteCard = async (id: string) => {
    await api.delete(`/plot-board/cards/${id}`);
    loadBoard();
  };

  const handleDragStart = (cardId: string) => setDraggedCard(cardId);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (arcId: string) => {
    if (!draggedCard) return;
    const arcCards = cards.filter((c) => c.arcId === arcId).map((c) => c.id);
    const cardIndex = arcCards.indexOf(draggedCard);
    if (cardIndex === -1) arcCards.push(draggedCard);
    await api.put('/plot-board/cards/reorder', { cardIds: arcCards, arcId });
    setDraggedCard(null);
    loadBoard();
  };

  if (loading) return <div className="p-8 text-gray-400">Загрузка...</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Доска сюжета</h2>
        <div className="flex-1" />
        <button onClick={handleAddArc} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
          <Plus size={14} /> Колонка
        </button>
      </div>

      <div className="flex-1 overflow-x-auto p-4">
        {arcs.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">Доска пуста</p>
            <p className="text-sm mt-1">Добавьте колонки для сюжетных линий</p>
          </div>
        ) : (
          <div className="flex gap-4 h-full">
            {arcs.map((arc) => {
              const arcCards = cards.filter((c) => c.arcId === arc.id).sort((a, b) => a.sortOrder - b.sortOrder);
              return (
                <div
                  key={arc.id}
                  className="w-72 flex-shrink-0 bg-gray-50 rounded-lg flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(arc.id)}
                >
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: arc.color || '#94a3b8' }} />
                    <span className="flex-1 text-sm font-medium text-gray-700">{arc.title}</span>
                    <Badge variant="default">{arcCards.length}</Badge>
                    <button onClick={() => handleDeleteArc(arc.id)} className="p-0.5 rounded hover:bg-gray-200 text-gray-400">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                    {arcCards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(card.id)}
                        className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab hover:border-gray-300 group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{card.title}</div>
                            {card.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{card.description}</div>
                            )}
                            {card.scene && (
                              <Badge variant={card.scene.status === 'final' ? 'final' : 'draft'} className="mt-2">
                                {card.scene.title || 'Сцена'}
                              </Badge>
                            )}
                          </div>
                          <button onClick={() => handleDeleteCard(card.id)} className="p-0.5 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddCard(arc.id)}
                      className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      + Добавить карточку
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
