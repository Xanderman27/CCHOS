'use client';

import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import type { RequestRow } from '@/lib/db';

interface ExportTabProps {
  requests: RequestRow[];
}

export default function ExportTab({ requests }: ExportTabProps) {
  const [statusFilter, setStatusFilter] = useState('approved');

  const filtered = useMemo(() => {
    if (!statusFilter) return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  const handleExport = async (format: 'csv' | 'json') => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (statusFilter) params.set('status', statusFilter);

    const res = await fetch(`/api/export?${params.toString()}`);
    const blob = await res.blob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'csv'
      ? `cch-requests-${new Date().toISOString().split('T')[0]}.csv`
      : `cch-requests-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Export Request Data</h3>
        <p className="text-sm text-slate-500 mb-4">
          Filter and export request data in CSV or JSON format for reporting and record-keeping.
        </p>

        <div className="flex items-center gap-3 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
          >
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
          </select>

          <span className="text-xs text-slate-400">
            {filtered.length} records to export
          </span>

          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={() => handleExport('csv')}>
              Download CSV
            </Button>
            <Button variant="secondary" onClick={() => handleExport('json')}>
              Download JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Export Preview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">ID</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Organization</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-400">
                    No records match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 text-slate-500 font-mono">#{r.id}</td>
                    <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{new Date(r.created_at + 'Z').toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-slate-800">{r.name}</td>
                    <td className="px-3 py-2 text-slate-600">{r.organization}</td>
                    <td className="px-3 py-2 text-slate-600 capitalize">{r.request_type.replace('_', ' ')}</td>
                    <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-2 text-slate-600 capitalize">{r.ai_priority || '--'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
