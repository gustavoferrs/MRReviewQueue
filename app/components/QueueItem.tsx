'use client';

import { useEffect, useState } from 'react';
import type { MRItem } from '@/lib/types';

interface QueueItemProps {
  item: MRItem;
  position: number;
}

function useElapsed(addedAt: string) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    function calc() {
      const diff = Date.now() - new Date(addedAt).getTime();
      const totalMins = Math.floor(diff / 60000);
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      if (hours > 0) {
        setElapsed(`${hours}h ${mins}min`);
      } else if (mins > 0) {
        setElapsed(`${mins}min`);
      } else {
        setElapsed('agora mesmo');
      }
    }
    calc();
    const id = setInterval(calc, 30000);
    return () => clearInterval(id);
  }, [addedAt]);

  return elapsed;
}

const positionColors: Record<number, string> = {
  1: 'bg-green-500 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-red-500 text-white',
};

export default function QueueItem({ item, position }: QueueItemProps) {
  const elapsed = useElapsed(item.addedAt);
  const posClass = positionColors[position] ?? 'bg-gray-200 text-gray-700';
  const teamColor = item.team === 'Turing' ? 'bg-blue-100 text-[#185FA5]' : 'bg-purple-100 text-[#534AB7]';

  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-xl border ${item.current ? 'border-green-400 shadow-md' : 'border-gray-100 shadow-sm'} transition-all`}>
      <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${posClass}`}>
        {position}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.dev}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{item.mr}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${teamColor}`}>
          {item.team}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          aguardando há {elapsed}
        </span>
      </div>
    </div>
  );
}
