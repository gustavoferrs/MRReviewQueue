'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import type { MRItem, HistoryItem, Team } from '@/lib/types';
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
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${teamColor}`}>{item.team}</span>
        <span className="text-xs text-gray-600">em revisão há {elapsed}</span>
        {item.mrLink && (
          <a href={item.mrLink} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors">
            Ver MR ↗
          </a>
        )}
        {item.storyLink && (
          <a href={item.storyLink} target="_blank" rel="noopener noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
            Ver história ↗
          </a>
        )}
      </div>
    </div>
  );
}

interface AddMRModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddMRModal({ onClose, onSuccess }: AddMRModalProps) {
  const [mr, setMr] = useState('');
  const [dev, setDev] = useState('');
  const [team, setTeam] = useState<Team>('Turing');
  const [mrLink, setMrLink] = useState('');
  const [storyLink, setStoryLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mr, dev, team, mrLink, storyLink }),
      });
      if (!res.ok) throw new Error('Erro ao adicionar MR.');
      onSuccess();
      onClose();
    } catch {
      setError('Não foi possível adicionar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#161b27] rounded-2xl border border-[#1e2535] shadow-2xl p-6 z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-100">Adicionar MR à fila</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-[#1e2535] transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Nome do MR *</label>
            <input
              type="text"
              value={mr}
              onChange={(e) => setMr(e.target.value)}
              placeholder="ex: !142 — feat: autenticação JWT"
              required
              className="w-full px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Nome do desenvolvedor *</label>
            <input
              type="text"
              value={dev}
              onChange={(e) => setDev(e.target.value)}
              placeholder="ex: João Silva"
              required
              className="w-full px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Time *</label>
            <div className="flex gap-2">
              {(['Turing', 'Asgard'] as Team[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTeam(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                    team === t
                      ? t === 'Turing'
                        ? 'bg-[#185FA5]/20 border-[#185FA5]/50 text-blue-300'
                        : 'bg-[#534AB7]/20 border-[#534AB7]/50 text-purple-300'
                      : 'bg-[#1e2535] border-[#2a3347] text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Link do MR</label>
            <input
              type="url"
              value={mrLink}
              onChange={(e) => setMrLink(e.target.value)}
              placeholder="https://gitlab.com/..."
              className="w-full px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1.5 font-medium">Link da história</label>
            <input
              type="url"
              value={storyLink}
              onChange={(e) => setStoryLink(e.target.value)}
              placeholder="https://jira.com/..."
              className="w-full px-4 py-2.5 bg-[#1e2535] border border-[#2a3347] rounded-xl text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#1e2535] text-gray-400 text-sm font-medium rounded-xl hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !mr.trim() || !dev.trim()}
              className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PublicQueue() {
  const [data, setData] = useState<PublicQueueData>({ queue: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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

  function handleSuccess() {
    fetchData();
    setToastMsg('MR adicionado à fila!');
    setTimeout(() => setToastMsg(''), 3000);
  }

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
    <>
      {showModal && (
        <AddMRModal onClose={() => setShowModal(false)} onSuccess={handleSuccess} />
      )}

      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white bg-green-600">
          {toastMsg}
        </div>
      )}

      <div className="space-y-6">
        {/* Revisando agora */}
        {currentItem ? (
          <CurrentCard item={currentItem} />
        ) : (
          <div className="bg-[#161b27] rounded-2xl border border-dashed border-[#1e2535] p-5 text-center">
            <p className="text-sm text-gray-600">Nenhum MR em revisão no momento</p>
          </div>
        )}

        {/* Stats + botão adicionar */}
        <div className="flex items-stretch gap-3">
          <div className="flex-1 grid grid-cols-3 gap-3">
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

          <button
            onClick={() => setShowModal(true)}
            className="flex flex-col items-center justify-center gap-1 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl transition-colors font-medium text-sm min-w-[80px]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs leading-tight text-center">Adicionar<br />MR</span>
          </button>
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
    </>
  );
}
