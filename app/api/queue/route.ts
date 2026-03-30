import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getQueue, saveQueue, getHistory, saveHistory } from '@/lib/kv';
import { isAuthenticated } from '@/lib/auth';
import type { MRItem, HistoryItem } from '@/lib/types';

export async function GET() {
  try {
    const [queue, history] = await Promise.all([getQueue(), getHistory()]);
    return NextResponse.json({ queue, history });
  } catch (error) {
    console.error('GET /api/queue error:', error);
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { mr, dev, team } = body;

    if (!mr || !dev || !team) {
      return NextResponse.json({ error: 'Missing required fields: mr, dev, team' }, { status: 400 });
    }
    if (team !== 'Turing' && team !== 'Asgard') {
      return NextResponse.json({ error: 'Team must be Turing or Asgard' }, { status: 400 });
    }

    const queue = await getQueue();
    const newItem: MRItem = {
      id: nanoid(),
      mr: mr.trim(),
      dev: dev.trim(),
      team,
      addedAt: new Date().toISOString(),
      current: false,
    };

    queue.push(newItem);
    await saveQueue(queue);

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error('POST /api/queue error:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'reorder') {
      const { queue: newQueue } = body as { queue: MRItem[] };
      if (!Array.isArray(newQueue)) {
        return NextResponse.json({ error: 'queue must be an array' }, { status: 400 });
      }
      await saveQueue(newQueue);
      return NextResponse.json({ success: true });
    }

    if (action === 'setNow') {
      const { id } = body as { id: string };
      const queue = await getQueue();
      const updated = queue.map((item) => ({ ...item, current: item.id === id }));
      await saveQueue(updated);
      return NextResponse.json({ success: true });
    }

    if (action === 'done') {
      const { id } = body as { id: string };
      const [queue, history] = await Promise.all([getQueue(), getHistory()]);
      const itemIndex = queue.findIndex((i) => i.id === id);
      if (itemIndex === -1) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      const [item] = queue.splice(itemIndex, 1);
      const historyItem: HistoryItem = { ...item, doneAt: new Date().toISOString() };
      history.unshift(historyItem);
      await Promise.all([saveQueue(queue), saveHistory(history)]);
      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      const { id } = body as { id: string };
      const queue = await getQueue();
      const filtered = queue.filter((i) => i.id !== id);
      await saveQueue(filtered);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/queue error:', error);
    return NextResponse.json({ error: 'Failed to update queue' }, { status: 500 });
  }
}
