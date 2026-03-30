'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { MRItem, HistoryItem, Team } from '@/lib/types';
import AdminItem from './AdminItem';

interface AdminPanelProps {
  password: string;
}

interface QueueData {
  queue: MRItem[];
  history: HistoryItem[];
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      {message}
    </div>
  );
}

export default function AdminPanel({ password }: AdminPanelProps) {
  const [data, setData] = useState<QueueData>({ queue: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formMr, setFormMr] = useState('');
  const [formDev, setFormDev] = useState('');
  const [formTeam, setFormTeam] = useState<Team>('Turing');
  const [formLoading, setFormLoading] = useState(false);
  const [clearingHistory, setClearingHistory] = useState(false);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = data.queue.findIndex((i) => i.id === active.id);
    const newIndex = data.queue.findIndex((i) => i.id === over.id);
    const newQueue = arrayMove(data.queue, oldIndex, newIndex);
    setData((prev) => ({ ...prev, queue: newQueue }));

    try {
      const res = await fetch('/api/queue', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ action: 'reorder', queue: newQueue }),
      });
      if (!res.ok) throw new Error();
    } catch {
      showToast('Erro ao reordenar. Recarregando...', 'error');
      fetchData();
    }
  }

  async function handleAddMR(e: FormEvent) {
    e.preventDefault();
    if (!formMr.trim() || !formDev.trim()) return;
    setFormLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ mr: formMr, dev: formDev, team: formTeam }),
      });
      if (!res.ok) throw new Error();
      setFormMr('');
      setFormDev('');
      setFormTeam('Turing');
      showToast('MR adicionado com sucesso!', 'success');
      fetchData();
    } catch {
      showToast('Erro ao adicionar MR.', 'error');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleClearHistory() {
    if (!confirm('Limpar todo o histórico? Esta ação não pode ser desfeita.')) return;
    setClearingHistory(true);
    try {
      const res = await fetch('/api/queue/history', {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      if (!res.ok) throw new Error();
      showToast('Histórico limpo!', 'success');
      fetchData();
    } catch {
      showToast('Erro ao limpar histórico.', 'error');
    } finally {
      setClearingHistory(false);
    }
  }

  function formatDoneAt(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#1e2535] border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  const { queue, history } = data;

  return (
    <div className="space-y-8">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Add MR form */}
      <div className="bg-[#161b27] rounded-2xl border border-[#1e2535] p-6">
        <h3 className="text-base font-bold text-gray-100 mb-4">Adicionar MR à fila</h3>
        <form onSubmit={handleAddMR} className="space-y-3">
          <input
            type="text"
            value={formMr}
            onChange={(e) => setFormMr(e.target.value)}
            placeholder="MR + descrição  (ex: !142 — feat: autenticação JWT)"
            required
            className="w-full px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex gap-3">
            <input
              type="text"
              value={formDev}
              onChange={(e) => setFormDev(e.target.value)}
              placeholder="Nome do desenvolvedor"
              required
              className="flex-1 px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={formTeam}
              onChange={(e) => setFormTeam(e.target.value as Team)}
              className="px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Turing">Turing</option>
              <option value="Asgard">Asgard</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={formLoading || !formMr.trim() || !formDev.trim()}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {formLoading ? 'Adicionando...' : '+ Adicionar à fila'}
          </button>
        </form>
      </div>

      {/* Queue drag & drop */}
      <div>
        <h3 className="text-base font-bold text-gray-100 mb-3">
          Fila atual{' '}
          <span className="text-sm font-normal text-gray-600">({queue.length} itens)</span>
        </h3>
        {queue.length === 0 ? (
          <div className="bg-[#161b27] rounded-2xl border border-dashed border-[#1e2535] p-8 text-center">
            <p className="text-sm text-gray-600">Fila vazia</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={queue.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {queue.map((item) => (
                  <AdminItem
                    key={item.id}
                    item={item}
                    password={password}
                    onRefresh={fetchData}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-100">
            Histórico{' '}
            <span className="text-sm font-normal text-gray-600">({history.length} revisados)</span>
          </h3>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearingHistory}
              className="text-xs text-red-500 hover:text-red-400 font-medium disabled:opacity-50 transition-colors"
            >
              {clearingHistory ? 'Limpando...' : 'Limpar histórico'}
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-[#161b27] rounded-2xl border border-dashed border-[#1e2535] p-8 text-center">
            <p className="text-sm text-gray-600">Nenhum MR revisado ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => {
              const teamColor =
                item.team === 'Turing'
                  ? 'bg-blue-900/40 text-blue-300'
                  : 'bg-purple-900/40 text-purple-300';
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-[#161b27] rounded-xl border border-[#1e2535]"
                >
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#1e2535] text-gray-400 flex-shrink-0">
                    Done ✓
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-100 truncate">{item.dev}</p>
                    <p className="text-xs text-gray-600 truncate">{item.mr}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${teamColor}`}>
                      {item.team}
                    </span>
                    <span className="text-xs text-gray-600">{formatDoneAt(item.doneAt)}</span>
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
