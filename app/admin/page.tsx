'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QueueTab from '@/components/admin/QueueTab';
import DetailView from '@/components/admin/DetailView';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import ExportTab from '@/components/admin/ExportTab';
import InventoryTab from '@/components/admin/InventoryTab';
import SettingsTab from '@/components/admin/SettingsTab';
import StaffTab from '@/components/admin/StaffTab';
import type { RequestRow } from '@/lib/db';

type Tab = 'queue' | 'analytics' | 'staff' | 'inventory' | 'export' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'queue', label: 'Request Queue' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'staff', label: 'Staff' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'export', label: 'Export' },
  { id: 'settings', label: 'Settings' },
];

interface AuthUser {
  id: number;
  username: string;
  displayName: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('queue');
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          } else {
            router.push('/admin/login');
            return;
          }
        } else {
          router.push('/admin/login');
          return;
        }
      } catch {
        router.push('/admin/login');
        return;
      }
      setAuthChecked(true);
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const selectedRequest = selectedRequestId
    ? requests.find(r => r.id === selectedRequestId) || null
    : null;

  const handleCloseDetail = () => setSelectedRequestId(null);

  const handleUpdateRequest = async (id: number, updates: Partial<RequestRow>) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        await fetchRequests();
      }
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  // Show nothing while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Verifying access...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Tabs + User */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex items-end justify-between gap-2">
          <nav className="flex gap-4 sm:gap-6 overflow-x-auto -mb-px scrollbar-hide" aria-label="Tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedRequestId(null);
              }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-ihc-purple text-ihc-deep'
                  : 'border-transparent text-slate-500 hover:text-ihc-deep hover:border-ihc-light'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </nav>
          {user && (
            <div className="hidden sm:flex items-center gap-3 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-ihc-surface flex items-center justify-center">
                  <span className="text-xs font-medium text-ihc-purple">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-600">{user.displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
        {/* Mobile user bar */}
        {user && (
          <div className="flex sm:hidden items-center justify-between py-2 mt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-ihc-surface flex items-center justify-center">
                <span className="text-[10px] font-medium text-slate-600">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs text-slate-600">{user.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-sm text-slate-500">Loading requests...</div>
        </div>
      ) : (
        <>
          {activeTab === 'queue' && !selectedRequest && (
            <QueueTab
              requests={requests}
              onSelectRequest={(id) => setSelectedRequestId(id)}
            />
          )}

          {activeTab === 'queue' && selectedRequest && (
            <DetailView
              request={selectedRequest}
              onClose={handleCloseDetail}
              onUpdate={handleUpdateRequest}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab requests={requests} />
          )}

          {activeTab === 'staff' && (
            <StaffTab requests={requests} />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab />
          )}

          {activeTab === 'export' && (
            <ExportTab requests={requests} />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </>
      )}
    </div>
  );
}
