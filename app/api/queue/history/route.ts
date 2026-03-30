import { NextRequest, NextResponse } from 'next/server';
import { saveHistory } from '@/lib/kv';
import { isAuthenticated } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await saveHistory([]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/queue/history error:', error);
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
