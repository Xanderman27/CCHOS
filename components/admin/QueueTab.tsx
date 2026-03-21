'use client';

import { useState, useMemo, useCallback } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import { MATERIAL_CATEGORIES } from '@/lib/materials';
import { TOPICS } from '@/lib/constants';
import type { RequestRow } from '@/lib/db';

interface QueueTabProps {
  requests: RequestRow[];
  onSelectRequest: (id: number) => void;
}

const TYPE_LABELS: Record<string, string> = {
  mailing: 'Mailing',
  in_person: 'In-Person',
  virtual: 'Virtual',
  pickup: 'Pickup',
};

/** Extract short category labels from a request's materials or topics */
function getRequestCategories(request: RequestRow): string[] {
  // For mailing/pickup: extract material category names
  if ((request.request_type === 'mailing' || request.request_type === 'pickup') && request.materials) {
    try {
      const items: { itemId: string }[] = JSON.parse(request.materials);
      const catIds = new Set<string>();
      for (const m of items) {
        const cat = MATERIAL_CATEGORIES.find(c => c.items.some(i => i.id === m.itemId));
        if (cat) catIds.add(cat.nameEn);
      }
      return [...catIds];
    } catch { return []; }
  }
  // For events: extract topic names
  if ((request.request_type === 'in_person' || request.request_type === 'virtual') && request.topics) {
    try {
      const topicIds: string[] = JSON.parse(request.topics);
      return topicIds.map(id => {
        const topic = TOPICS.find(t => t.id === id);
        return topic?.en || id;
      });
    } catch { return []; }
  }
  return [];
}

/** Inline expandable resource badges — shows 1 badge + "+N" overflow, click to expand */
function ResourceBadges({ categories }: { categories: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (categories.length === 0) return <span className="text-xs text-slate-400">--</span>;

  const visible = expanded ? categories : categories.slice(0, 1);
  const overflow = categories.length - 1;

  return (
    <div
      className="flex items-center gap-1 cursor-pointer"
      onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
    >
      <div className={`flex ${expanded ? 'flex-wrap' : 'flex-nowrap'} gap-1 min-w-0`}>
        {visible.map(c => (
          <span key={c} className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 truncate max-w-[140px] whitespace-nowrap">
            {c}
          </span>
        ))}
      </div>
      {!expanded && overflow > 0 && (
        <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-500 whitespace-nowrap shrink-0">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export default function QueueTab({ requests, onSelectRequest }: QueueTabProps) {
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...requests];

    if (statusFilter) result = result.filter(r => r.status === statusFilter);
    if (typeFilter) result = result.filter(r => r.request_type === typeFilter);
    if (priorityFilter) result = result.filter(r => r.ai_priority === priorityFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.organization.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField] ?? '';
      const bVal = (b as Record<string, unknown>)[sortField] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [requests, statusFilter, typeFilter, priorityFilter, search, sortField, sortDir]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th
      className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none"
      onClick={() => toggleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-slate-400">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name, org, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1 w-full sm:w-64"
        />
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
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
        >
          <option value="">All Types</option>
          <option value="mailing">Mailing</option>
          <option value="in_person">In-Person</option>
          <option value="virtual">Virtual</option>
          <option value="pickup">Pickup</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
        >
          <option value="">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">
          {filtered.length} of {requests.length} requests
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <SortHeader field="id">ID</SortHeader>
                <SortHeader field="created_at">Date</SortHeader>
                <SortHeader field="name">Name</SortHeader>
                <SortHeader field="organization">Organization</SortHeader>
                <SortHeader field="request_type">Type</SortHeader>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Resources</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Priority</th>
                <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-slate-400">
                    No requests match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map(request => (
                  <tr
                    key={request.id}
                    onClick={() => onSelectRequest(request.id)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-sm text-slate-500 font-mono">#{request.id}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600 whitespace-nowrap">
                      {new Date(request.created_at + 'Z').toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-800 font-medium">{request.name}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600 max-w-48 truncate">{request.organization}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-600">
                      {TYPE_LABELS[request.request_type] || request.request_type}
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <ResourceBadges categories={getRequestCategories(request)} />
                    </td>
                    <td className="px-3 py-2.5">
                      {request.ai_priority ? <PriorityBadge priority={request.ai_priority} /> : <span className="text-xs text-slate-400">--</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={request.status} />
                    </td>
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
