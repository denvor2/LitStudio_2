import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { exportToDOCX, downloadFB2, downloadPDF } from '../../lib/export';
import { X, Download, FileText, File, FileType } from 'lucide-react';

interface ExportDialogProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Chapter {
  title: string;
  scenes: {
    title: string | null;
    content: string;
  }[];
}

interface BookData {
  title: string;
  subtitle: string | null;
  chapters: Chapter[];
}

export function ExportDialog({ bookId, isOpen, onClose }: ExportDialogProps) {
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadBook = useCallback(async () => {
    try {
      const data = await api.get<BookData>(`/books/${bookId}`);
      setBook(data);
    } catch (err) {
      console.error('Failed to load book:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => { if (isOpen) loadBook(); }, [isOpen, loadBook]);

  const handleExport = async (format: 'docx' | 'pdf' | 'fb2') => {
    if (!book) return;
    setExporting(true);
    try {
      const options = {
        title: book.title,
        subtitle: book.subtitle || undefined,
        chapters: book.chapters,
      };

      switch (format) {
        case 'docx':
          await exportToDOCX(options);
          break;
        case 'pdf':
          downloadPDF(options);
          break;
        case 'fb2':
          downloadFB2(options);
          break;
      }
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Экспорт книги</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Загрузка...</div>
          ) : !book ? (
            <div className="text-center text-gray-400 py-8">Ошибка загрузки</div>
          ) : (
            <>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{book.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {book.chapters.length} глав,{' '}
                  {book.chapters.reduce((sum, ch) => sum + ch.scenes.length, 0)} сцен
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport('docx')}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Microsoft Word (.docx)</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Стандартный формат для редакторов</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <File size={20} className="text-red-600 dark:text-red-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">PDF</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Для печати и просмотра</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('fb2')}
                  disabled={exporting}
                  className="w-full flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <FileType size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">FB2</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Для электронных книг и площадок</div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
