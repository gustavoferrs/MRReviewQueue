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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MR Review Queue</h1>
              <p className="text-sm text-gray-500 mt-0.5">Fila de code review — Times Turing &amp; Asgard</p>
            </div>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Sair
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('public')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'public'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Fila pública
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin {isAuthenticated && <span className="text-green-500">●</span>}
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
