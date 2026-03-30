import { NextRequest } from 'next/server';

export function isAuthenticated(req: NextRequest): boolean {
  const password = req.headers.get('x-admin-password');
  return password === process.env.ADMIN_PASSWORD;
}
