'use client';

import { Priority } from '@/lib/constants';

const priorityStyles: Record<Priority, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  high: 'bg-orange-100 text-orange-800 border-orange-400',
  urgent: 'bg-red-50 text-red-700 border-red-200',
};

const priorityLabels: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function PriorityBadge({ priority }: { priority: string }) {
  const p = priority as Priority;
  const style = priorityStyles[p] || 'bg-slate-100 text-slate-600 border-slate-200';
  const label = priorityLabels[p] || priority;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${style}`}>
      {label}
    </span>
  );
}
