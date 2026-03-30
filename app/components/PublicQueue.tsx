'use client';

import { useEffect, useState, useCallback } from 'react';
import type { MRItem, HistoryItem } from '@/lib/types';
import QueueItem from './QueueItem';

type TeamFilter = 'Todos' | 'Turing' | 'Asgard';

interface PublicQueueData {
  queue: MRItem[];
  history: HistoryItem[];
}

function useElapsed(addedAt: string | undefined) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!addedAt) return;
    function calc() {
      const diff = Date.now() - new Date(addedAt!).getTime();
      const totalMins = Math.floor(diff / 60000);
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      if (hours > 0) setElapsed(`${hours}h ${mins}min`);
      else if (mins > 0) setElapsed(`${mins}min`);
      else setElapsed('agora mesmo');
    }
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [addedAt]);
  return elapsed;
}

function CurrentCard({ item }: { item: MRItem }) {
  const elapsed = useElapsed(item.addedAt);
  const teamColor =
    item.team === 'Turing'
      ? 'text-blue-300 bg-blue-900/40'
      : 'text-purple-300 bg-purple-900/40';

  return (
    <div className="bg-[#161b27] rounded-2xl border border-green-500/30 shadow-lg shadow-green-900/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        <span className="text-sm font-semibold text-green-400">Revisando agora</span>
      </div>
      <p className="text-base font-bold text-gray-100">{item.dev}</p>
      <p className="text-sm text-gray-500 mt-0.5 mb-3">{item.mr}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${teamColor}`}>{item.team}</span>
        <span className="text-xs text-gray-600">em revisão há {elapsed}</span>
      </div>
    </div>
  );
}

export default function PublicQueue() {
  const [data, setData] = useState<PublicQueueData>({ queue: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('Todos');

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

  const { queue } = data;
  const currentItem = queue.find((i) => i.current);
  const waitingQueue = queue.filter((i) => !i.current);

  const filtered = waitingQueue.filter((item) => {
    const matchTeam = teamFilter === 'Todos' || item.team === teamFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q || item.dev.toLowerCase().includes(q) || item.mr.toLowerCase().includes(q);
    return matchTeam && matchSearch;
  });

  const exactOneResult =
    search.trim() !== '' && filtered.length === 1 && teamFilter === 'Todos';
  const foundPosition = exactOneResult
    ? waitingQueue.findIndex((i) => i.id === filtered[0].id) + 1
    : -1;

  const turingCount = waitingQueue.filter((i) => i.team === 'Turing').length;
  const asgardCount = waitingQueue.filter((i) => i.team === 'Asgard').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-[#1e2535] border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Revisando agora */}
      {currentItem ? (
        <CurrentCard item={currentItem} />
      ) : (
        <div className="bg-[#161b27] rounded-2xl border border-dashed border-[#1e2535] p-5 text-center">
          <p className="text-sm text-gray-600">Nenhum MR em revisão no momento</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#161b27] rounded-xl border border-[#1e2535] p-4 text-center">
          <p className="text-2xl font-bold text-gray-100">{waitingQueue.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Na fila</p>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-[#1e2535] p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{turingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Turing</p>
        </div>
        <div className="bg-[#161b27] rounded-xl border border-[#1e2535] p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{asgardCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Asgard</p>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar dev ou número do MR..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#161b27] border border-[#1e2535] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['Todos', 'Turing', 'Asgard'] as TeamFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTeamFilter(t)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                teamFilter === t
                  ? t === 'Turing'
                    ? 'bg-[#185FA5] text-white'
                    : t === 'Asgard'
                    ? 'bg-[#534AB7] text-white'
                    : 'bg-gray-100/10 text-gray-100'
                  : 'bg-[#161b27] border border-[#1e2535] text-gray-500 hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Banner posição exata */}
      {exactOneResult && foundPosition > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-blue-300 font-medium">
            <span className="font-bold">{filtered[0].dev}</span> está na posição{' '}
            <span className="font-bold">#{foundPosition}</span> da fila geral
          </p>
        </div>
      )}

      {/* Queue list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-600">
              {search || teamFilter !== 'Todos' ? 'Nenhum resultado encontrado.' : 'Fila vazia! 🎉'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const globalPos = waitingQueue.findIndex((i) => i.id === item.id) + 1;
            return <QueueItem key={item.id} item={item} position={globalPos} />;
          })
        )}
      </div>
    </div>
  );
}
