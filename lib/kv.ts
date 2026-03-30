import { kv } from '@vercel/kv';
import type { MRItem, HistoryItem } from './types';

export async function getQueue(): Promise<MRItem[]> {
  try {
    const raw = await kv.get<string>('queue');
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as MRItem[]);
  } catch {
    return [];
  }
}

export async function saveQueue(queue: MRItem[]): Promise<void> {
  await kv.set('queue', JSON.stringify(queue));
}

export async function getHistory(): Promise<HistoryItem[]> {
  try {
    const raw = await kv.get<string>('history');
    if (!raw) return [];
    return typeof raw === 'string' ? JSON.parse(raw) : (raw as HistoryItem[]);
  } catch {
    return [];
  }
}

export async function saveHistory(history: HistoryItem[]): Promise<void> {
  await kv.set('history', JSON.stringify(history));
}
