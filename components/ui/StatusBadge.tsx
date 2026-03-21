'use client';

import { Status, STATUS_LABELS } from '@/lib/constants';

const statusStyles: Record<Status, string> = {
  submitted: 'bg-slate-100 text-slate-700 border-slate-200',
  in_review: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  fulfilled: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function StatusBadge({ status }: { status: string }) {
  const s = status as Status;
  const style = statusStyles[s] || 'bg-slate-100 text-slate-600 border-slate-200';
  const label = STATUS_LABELS[s] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}
