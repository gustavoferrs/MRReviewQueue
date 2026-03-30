'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MRItem } from '@/lib/types';

interface AdminItemProps {
  item: MRItem;
  password: string;
  onRefresh: () => void;
}

export default function AdminItem({ item, password, onRefresh }: AdminItemProps) {
  const [loadingSetNow, setLoadingSetNow] = useState(false);
  const [loadingDone, setLoadingDone] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const teamColor =
    item.team === 'Turing'
      ? 'bg-blue-900/40 text-blue-300'
      : 'bg-purple-900/40 text-purple-300';

  async function callPatch(body: object, setLoading: (v: boolean) => void) {
    setLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      onRefresh();
    } catch {
      alert('Erro ao executar ação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-[#161b27] rounded-xl border ${
        item.current ? 'border-green-500/40' : 'border-[#1e2535]'
      } group`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-700 hover:text-gray-400 p-1 rounded"
        title="Arrastar"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-6 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-gray-100 truncate">{item.dev}</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${teamColor}`}>
            {item.team}
          </span>
          {item.current && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 flex-shrink-0">
              Revisando
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 truncate mt-0.5">{item.mr}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => callPatch({ action: 'setNow', id: item.id }, setLoadingSetNow)}
          disabled={loadingSetNow || item.current}
          title="Revisar agora"
          className="px-2.5 py-1.5 text-xs font-medium bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loadingSetNow ? '...' : '▶ Revisar agora'}
        </button>
        <button
          onClick={() => callPatch({ action: 'done', id: item.id }, setLoadingDone)}
          disabled={loadingDone}
          title="Done"
          className="px-2.5 py-1.5 text-xs font-medium bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loadingDone ? '...' : 'Done ✓'}
        </button>
        <button
          onClick={() => callPatch({ action: 'remove', id: item.id }, setLoadingRemove)}
          disabled={loadingRemove}
          title="Remover"
          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-900/30 rounded-lg disabled:opacity-40 transition-colors"
        >
          {loadingRemove ? '...' : '✕'}
        </button>
      </div>
    </div>
  );
}
