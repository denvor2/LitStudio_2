import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Bot, Send, Sparkles, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

interface Expert {
  id: string;
  name: string;
  prompt: string;
  isBuiltin: boolean;
  quickActions: QuickAction[];
}

interface AIResponse {
  content: string;
  timestamp: string;
}

interface AIExpertsPanelProps {
  projectId: string;
  sceneText: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIExpertsPanel({ projectId, sceneText, isOpen, onClose }: AIExpertsPanelProps) {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // New expert form
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  const loadExperts = useCallback(async () => {
    try {
      const data = await api.get<Expert[]>(`/ai-experts/by-project/${projectId}`);
      setExperts(data);
    } catch (err) {
      console.error('Failed to load experts:', err);
    }
  }, [projectId]);

  useEffect(() => { loadExperts(); }, [loadExperts]);

  const handleInvoke = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const result = await api.post<AIResponse>('/ai-experts/invoke', {
        expertPrompt: selectedExpert?.prompt || '',
        text: sceneText,
        context: prompt,
      });
      setResponse(result);
    } catch (err) {
      console.error('Failed to invoke expert:', err);
      setResponse({ content: 'Ошибка при вызове эксперта', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    handleInvoke(action.prompt);
  };

  const handleCustomSubmit = () => {
    handleInvoke(customPrompt);
    setCustomPrompt('');
  };

  const handleCreateExpert = async () => {
    if (!newName || !newPrompt) return;
    try {
      await api.post('/ai-experts', {
        projectId,
        name: newName,
        prompt: newPrompt,
      });
      setNewName('');
      setNewPrompt('');
      setShowCreate(false);
      loadExperts();
    } catch (err) {
      console.error('Failed to create expert:', err);
    }
  };

  const handleDeleteExpert = async (id: string) => {
    if (!confirm('Удалить эксперта?')) return;
    try {
      await api.delete(`/ai-experts/${id}`);
      loadExperts();
    } catch (err) {
      console.error('Failed to delete expert:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI-эксперты</span>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="Создать эксперта">
          <Plus size={16} />
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Имя эксперта"
          />
          <textarea
            value={newPrompt}
            onChange={(e) => setNewPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            placeholder="Системный промпт..."
          />
          <div className="flex gap-2">
            <button onClick={handleCreateExpert} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Создать</button>
            <button onClick={() => setShowCreate(false)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Отмена</button>
          </div>
        </div>
      )}

      {/* Experts list */}
      <div className="flex-1 overflow-y-auto">
        {!selectedExpert ? (
          <div className="p-4 space-y-2">
            {experts.map((expert) => (
              <div
                key={expert.id}
                onClick={() => setSelectedExpert(expert)}
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Sparkles size={14} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{expert.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{expert.prompt}</div>
                </div>
                {!expert.isBuiltin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteExpert(expert.id); }}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Selected expert header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button onClick={() => { setSelectedExpert(null); setResponse(null); }} className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2">
                ← Назад к списку
              </button>
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{selectedExpert.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedExpert.prompt}</p>
            </div>

            {/* Quick actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Быстрые запросы</div>
              <div className="flex flex-wrap gap-2">
                {selectedExpert.quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    disabled={loading}
                    className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Response area */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm">Анализирую...</p>
                </div>
              ) : response ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={12} className="text-blue-500" />
                    <span className="text-xs text-gray-500">{selectedExpert.name}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {response.content}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Bot size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Выберите быстрый запрос или напишите свой</p>
                </div>
              )}
            </div>

            {/* Custom prompt input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Свой запрос..."
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={loading || !customPrompt.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
