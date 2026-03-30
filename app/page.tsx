'use client';

import { useState, useEffect } from 'react';
import PublicQueue from './components/PublicQueue';
import AdminPanel from './components/AdminPanel';
import LockScreen from './components/LockScreen';

type Tab = 'public' | 'admin';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('public');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('mr-admin-auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
      setPassword(process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '');
    }
  }, []);

  function handleUnlock() {
    setIsAuthenticated(true);
    setPassword(process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? '');
  }

  function handleLogout() {
    sessionStorage.removeItem('mr-admin-auth');
    setIsAuthenticated(false);
    setPassword('');
    setActiveTab('public');
  }

  return (
    <main className="min-h-screen bg-[#0d0f14]">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">MR Review Queue</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fila de code review — Times Turing &amp; Asgard</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Sair
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-1 bg-[#161b27] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'public'
                  ? 'bg-[#1e2535] text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Fila pública
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#1e2535] text-gray-100 shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Admin {isAuthenticated && <span className="text-green-400">●</span>}
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === 'public' ? (
          <PublicQueue />
        ) : isAuthenticated ? (
          <AdminPanel password={password} />
        ) : (
          <LockScreen onUnlock={handleUnlock} />
        )}
      </div>
    </main>
  );
}
