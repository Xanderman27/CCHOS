'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RequestRow } from '@/lib/db';

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  specialties: string | null;
  active: number;
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'Manager',
  coordinator: 'Coordinator',
  specialist: 'Specialist',
  logistics: 'Logistics',
};

const ROLE_STYLES: Record<string, string> = {
  manager: 'bg-ihc-surface text-ihc-deep border-ihc-light',
  coordinator: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  specialist: 'bg-amber-50 text-amber-800 border-amber-200',
  logistics: 'bg-slate-100 text-slate-700 border-slate-200',
};

interface StaffTabProps {
  requests: RequestRow[];
}

export default function StaffTab({ requests }: StaffTabProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/staff');
      if (res.ok) setStaff(await res.json());
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-sm text-slate-500">Loading staff...</div>;
  }

  function getAssignedRequests(staffId: number) {
    return requests.filter(r => r.assigned_staff_id === staffId);
  }

  function getActiveCount(staffId: number) {
    return getAssignedRequests(staffId).filter(r => r.status !== 'fulfilled').length;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">{staff.length} Staff Members</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.filter(s => s.active).map(member => {
          const assigned = getAssignedRequests(member.id);
          const activeCount = getActiveCount(member.id);
          const specialties = member.specialties?.split(', ') || [];

          return (
            <div key={member.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ihc-surface flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-ihc-purple">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{member.name}</h3>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium border ${ROLE_STYLES[member.role] || ROLE_STYLES.coordinator}`}>
                      {ROLE_LABELS[member.role] || member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                    {member.phone}
                  </div>
                )}
              </div>

              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {specialties.map(s => (
                    <span key={s} className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{assigned.length}</span> assigned
                  {activeCount > 0 && (
                    <span className="ml-2 text-ihc-purple font-medium">({activeCount} active)</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
