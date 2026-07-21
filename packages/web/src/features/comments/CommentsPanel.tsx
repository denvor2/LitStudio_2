import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { MessageSquare, Send, Check, Trash2, User } from 'lucide-react';

interface CommentAuthor {
  id: string;
  displayName: string | null;
  email: string;
}

interface CommentData {
  id: string;
  content: string;
  resolved: boolean;
  author: CommentAuthor;
  position: unknown;
  createdAt: string;
}

interface CommentsPanelProps {
  sceneId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsPanel({ sceneId, isOpen, onClose }: CommentsPanelProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  const loadComments = useCallback(async () => {
    if (!sceneId) return;
    try {
      const data = await api.get<CommentData[]>(`/comments/by-scene/${sceneId}`);
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [sceneId]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const comment = await api.post<CommentData>('/comments', { sceneId, content: newComment });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleResolve = async (id: string, resolved: boolean) => {
    try {
      await api.put(`/comments/${id}`, { resolved });
      setComments((prev) => prev.map((c) => c.id === id ? { ...c, resolved } : c));
    } catch (err) {
      console.error('Failed to resolve comment:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (!isOpen) return null;

  const unresolved = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);
  const visibleComments = showResolved ? comments : unresolved;

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Комментарии
          </span>
          <span className="text-xs text-gray-400">({unresolved.length})</span>
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`text-xs px-2 py-1 rounded ${showResolved ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} text-gray-500`}
        >
          {showResolved ? 'Скрыть resolved' : 'Показать resolved'}
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-gray-400 py-8">Загрузка...</div>
        ) : visibleComments.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Нет комментариев</p>
          </div>
        ) : (
          visibleComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-lg p-3 ${
                comment.resolved
                  ? 'bg-gray-50 dark:bg-gray-700/50 opacity-60'
                  : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <User size={12} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {comment.author.displayName || comment.author.email}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleResolve(comment.id, !comment.resolved)}
                    className={`p-1 rounded ${comment.resolved ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}
                    title={comment.resolved ? 'Вернуть' : 'Решить'}
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 rounded text-gray-400 hover:text-red-500"
                    title="Удалить"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleAddComment();
              }
            }}
            rows={2}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Добавить комментарий... (Ctrl+Enter)"
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
