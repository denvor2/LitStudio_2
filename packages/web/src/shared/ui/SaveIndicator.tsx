import { useState, useEffect } from 'react';

type SaveStatus = 'saved' | 'stale' | 'offline';

interface SaveIndicatorProps {
  lastSavedAt?: Date;
  isOffline?: boolean;
}

const statusConfig: Record<SaveStatus, { color: string; label: string }> = {
  saved: { color: 'bg-green-500', label: 'Сохранено' },
  stale: { color: 'bg-amber-500', label: 'Давно не сохранялось' },
  offline: { color: 'bg-red-500', label: 'Офлайн — в очереди' },
};

export function SaveIndicator({ lastSavedAt, isOffline = false }: SaveIndicatorProps) {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [tooltip, setTooltip] = useState('');

  useEffect(() => {
    if (isOffline) {
      setStatus('offline');
      setTooltip('Офлайн — изменения в локальной очереди');
      return;
    }

    if (!lastSavedAt) {
      setStatus('stale');
      setTooltip('Ещё не сохранялось');
      return;
    }

    const elapsed = Date.now() - lastSavedAt.getTime();
    if (elapsed > 5 * 60 * 1000) {
      setStatus('stale');
      const mins = Math.floor(elapsed / 60000);
      setTooltip(`${mins} мин назад`);
    } else {
      setStatus('saved');
      setTooltip('Сохранено недавно');
    }
  }, [lastSavedAt, isOffline]);

  const config = statusConfig[status];

  return (
    <div className="fixed bottom-4 right-4 z-40 group">
      <div className={`w-3 h-3 rounded-full ${config.color} transition-colors`} />
      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {tooltip}
      </div>
    </div>
  );
}
