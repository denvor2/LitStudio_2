import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function showToast(message: string, type: ToastType = 'success') {
  const id = String(++toastId);
  toasts = [...toasts, { id, message, type }];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-gray-800 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
};

export function ToastContainer() {
  const [currentToasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setToasts);
    return () => { listeners.delete(setToasts); };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm
            ${typeStyles[toast.type]}`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
