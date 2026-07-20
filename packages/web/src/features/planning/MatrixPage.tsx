import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Download, Link as LinkIcon, Trash2 } from 'lucide-react';

interface PlotLine {
  id: string;
  title: string;
  sortOrder: number;
}

interface MatrixCell {
  id: string;
  plotLineId: string;
  bitNumber: number;
  bitDescription: string | null;
  sceneId: string | null;
  status: string;
  scene?: { id: string; title: string | null; status: string } | null;
}

interface MatrixData {
  plotLines: PlotLine[];
  cells: MatrixCell[];
}

export function MatrixPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [matrix, setMatrix] = useState<MatrixData>({ plotLines: [], cells: [] });
  const [loading, setLoading] = useState(true);

  const loadMatrix = useCallback(async () => {
    if (!bookId) return;
    try {
      const data = await api.get<MatrixData>(`/matrix/by-book/${bookId}`);
      setMatrix(data);
    } catch (err) {
      console.error('Failed to load matrix:', err);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadMatrix();
  }, [loadMatrix]);

  // Add plot line
  const handleAddPlotLine = async () => {
    const title = prompt('Название сюжетной линии:');
    if (!title || !bookId) return;
    try {
      await api.post('/matrix/plot-lines', { bookId, title });
      loadMatrix();
    } catch (err) {
      console.error('Failed to add plot line:', err);
    }
  };

  // Delete plot line
  const handleDeletePlotLine = async (id: string) => {
    if (!confirm('Удалить сюжетную линию и все её ячейки?')) return;
    try {
      await api.delete(`/matrix/plot-lines/${id}`);
      loadMatrix();
    } catch (err) {
      console.error('Failed to delete plot line:', err);
    }
  };

  // Add cell
  const handleAddCell = async (plotLineId: string, bitNumber: number) => {
    try {
      await api.post('/matrix/cells', {
        bookId,
        plotLineId,
        bitNumber,
        bitDescription: '',
      });
      loadMatrix();
    } catch (err) {
      console.error('Failed to add cell:', err);
    }
  };

  // Update cell
  const handleUpdateCell = async (cellId: string, data: { bitDescription?: string; sceneId?: string | null }) => {
    try {
      await api.put(`/matrix/cells/${cellId}`, data);
      loadMatrix();
    } catch (err) {
      console.error('Failed to update cell:', err);
    }
  };

  // Delete cell
  const handleDeleteCell = async (cellId: string) => {
    try {
      await api.delete(`/matrix/cells/${cellId}`);
      loadMatrix();
    } catch (err) {
      console.error('Failed to delete cell:', err);
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ['#', ...matrix.plotLines.map((pl) => pl.title)];
    const maxBits = Math.max(...matrix.cells.map((c) => c.bitNumber), 0);
    const rows: string[][] = [];

    for (let bit = 1; bit <= maxBits; bit++) {
      const row = [String(bit)];
      for (const pl of matrix.plotLines) {
        const cell = matrix.cells.find((c) => c.plotLineId === pl.id && c.bitNumber === bit);
        row.push(cell?.bitDescription || cell?.scene?.title || '');
      }
      rows.push(row);
    }

    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 text-gray-400">Загрузка...</div>;
  }

  // Build grid data
  const maxBits = Math.max(...matrix.cells.map((c) => c.bitNumber), 5);
  const bits = Array.from({ length: maxBits }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white">
        <h2 className="text-sm font-semibold text-gray-700">Матрица романа</h2>
        <div className="flex-1" />
        <button
          onClick={handleAddPlotLine}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={14} />
          Линия
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Download size={14} />
          CSV
        </button>
      </div>

      {/* Matrix table */}
      <div className="flex-1 overflow-auto p-4">
        {matrix.plotLines.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-lg">Матрица пуста</p>
            <p className="text-sm mt-1">Добавьте сюжетные линии, чтобы начать</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-200 px-3 py-2 bg-gray-50 text-sm font-medium text-gray-600 w-12">
                    Бит
                  </th>
                  {matrix.plotLines.map((pl) => (
                    <th
                      key={pl.id}
                      className="border border-gray-200 px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 min-w-[200px] group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex-1">{pl.title}</span>
                        <button
                          onClick={() => handleDeletePlotLine(pl.id)}
                          className="p-0.5 rounded hover:bg-gray-200 text-gray-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="border border-gray-200 px-3 py-2 bg-gray-50 w-10" />
                </tr>
              </thead>
              <tbody>
                {bits.map((bit) => (
                  <tr key={bit}>
                    <td className="border border-gray-200 px-3 py-2 text-sm text-gray-500 text-center bg-gray-50">
                      {bit}
                    </td>
                    {matrix.plotLines.map((pl) => {
                      const cell = matrix.cells.find(
                        (c) => c.plotLineId === pl.id && c.bitNumber === bit
                      );

                      return (
                        <td
                          key={pl.id}
                          className={`border border-gray-200 px-2 py-1 text-sm min-w-[200px]
                            ${cell?.sceneId ? 'bg-blue-50' : ''}
                            ${cell?.status === 'not_participating' ? 'bg-gray-100' : ''}`}
                        >
                          {cell ? (
                            <div className="group flex items-start gap-1">
                              {cell.sceneId && (
                                <LinkIcon size={12} className="text-blue-500 mt-0.5 flex-shrink-0" />
                              )}
                              <input
                                type="text"
                                value={cell.bitDescription || ''}
                                onChange={(e) => handleUpdateCell(cell.id, { bitDescription: e.target.value })}
                                className="flex-1 bg-transparent border-none outline-none text-sm resize-none"
                                placeholder="Описание бита..."
                              />
                              <button
                                onClick={() => handleDeleteCell(cell.id)}
                                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddCell(pl.id, bit)}
                              className="w-full text-left text-gray-400 hover:text-gray-600 text-sm py-0.5"
                            >
                              +
                            </button>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 px-1" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
