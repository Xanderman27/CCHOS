'use client';

import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityBadge from '@/components/ui/PriorityBadge';
import Button from '@/components/ui/Button';
import type { RequestRow, InventoryRow } from '@/lib/db';
import { TOPICS, TARGET_AUDIENCES } from '@/lib/constants';
import { getMaterialById } from '@/lib/materials';
import { AI_PRIORITY_CRITERIA } from '@/lib/ai-criteria';

interface DetailViewProps {
  request: RequestRow;
  onClose: () => void;
  onUpdate: (id: number, updates: Partial<RequestRow>) => Promise<void>;
}

const TYPE_LABELS: Record<string, string> = {
  mailing: 'Mailing',
  in_person: 'In-Person Event',
  virtual: 'Virtual Presentation',
  pickup: 'Pickup',
};

export default function DetailView({ request, onClose, onUpdate }: DetailViewProps) {
  const [status, setStatus] = useState(request.status);
  const [priority, setPriority] = useState(request.ai_priority || '');
  const [assignedStaffId, setAssignedStaffId] = useState<string>(
    request.assigned_staff_id ? String(request.assigned_staff_id) : ''
  );
  const [staffList, setStaffList] = useState<{ id: number; name: string; role: string }[]>([]);
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || '');
  const [fulfillmentPath, setFulfillmentPath] = useState(request.fulfillment_path || '');
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [translation, setTranslation] = useState<{
    detected_language: string;
    translation: string;
    target_language: string;
  } | null>(
    // Load stored translation if available
    request.translation_text ? {
      detected_language: request.translation_detected_language || 'Unknown',
      translation: request.translation_text,
      target_language: request.translation_target_language || 'English',
    } : null
  );
  const [translating, setTranslating] = useState(false);
  const [isEnglish, setIsEnglish] = useState(
    // If we previously detected English (stored language is English and no translation text), hide button
    request.translation_detected_language === 'English' && !request.translation_text
  );
  const [showCriteria, setShowCriteria] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) setInventory(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetch('/api/staff').then(r => r.ok ? r.json() : []).then(setStaffList).catch(() => {});
  }, []);

  useEffect(() => {
    if (request.request_type === 'mailing' || request.request_type === 'pickup') {
      fetchInventory();
    }
  }, [request.request_type, fetchInventory]);

  const handleSave = async () => {
    setSaving(true);
    const updates: Partial<RequestRow> = {
      status,
      ai_priority: priority || undefined,
      assigned_staff_id: assignedStaffId ? parseInt(assignedStaffId) : null,
      admin_notes: adminNotes || undefined,
      fulfillment_path: fulfillmentPath || undefined,
    } as Partial<RequestRow>;

    if (status === 'approved' && request.status !== 'approved') {
      (updates as Record<string, unknown>).approved_by = 'Admin';
      (updates as Record<string, unknown>).approved_at = new Date().toISOString();
    }

    await onUpdate(request.id, updates);
    setSaving(false);
  };

  const handleTranslate = async () => {
    if (!request.additional_notes) return;
    setTranslating(true);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: request.additional_notes }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.is_english) {
          // Text is already English — no translation needed
          setIsEnglish(true);
          // Persist that we detected English so we don't re-check
          await onUpdate(request.id, {
            translation_detected_language: data.detected_language,
          } as Partial<RequestRow>);
        } else {
          setTranslation(data);
          // Persist the translation to the database
          await onUpdate(request.id, {
            translation_text: data.translation,
            translation_detected_language: data.detected_language,
            translation_target_language: data.target_language,
          } as Partial<RequestRow>);
        }
      }
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setTranslating(false);
    }
  };

  const materials = request.materials ? JSON.parse(request.materials) : [];
  const topics = request.topics ? JSON.parse(request.topics) : [];
  const audience = request.target_audience ? JSON.parse(request.target_audience) : [];
  const aiTags = request.ai_tags ? JSON.parse(request.ai_tags) : [];

  const getTopicLabel = (id: string) => TOPICS.find(t => t.id === id)?.en || id;
  const getAudienceLabel = (id: string) => TARGET_AUDIENCES.find(a => a.id === id)?.en || id;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Queue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-semibold text-slate-800">Request #{request.id}</h2>
                  <StatusBadge status={request.status} />
                  {request.ai_priority && <PriorityBadge priority={request.ai_priority} />}
                </div>
                <p className="text-sm text-slate-500">
                  Submitted {new Date(request.created_at + 'Z').toLocaleString()} &bull; {TYPE_LABELS[request.request_type]}
                </p>
              </div>
              {(request.request_type === 'in_person' || request.request_type === 'virtual') && request.status === 'approved' && (
                <a
                  href={`/api/calendar/${request.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  Download Calendar Invite
                </a>
              )}
            </div>

            {/* Requestor Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
              <div>
                <span className="text-slate-500">Name:</span>
                <span className="ml-2 text-slate-800 font-medium">{request.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Organization:</span>
                <span className="ml-2 text-slate-800">{request.organization}</span>
              </div>
              <div className="break-all">
                <span className="text-slate-500">Email:</span>
                <span className="ml-2 text-slate-800">{request.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Type:</span>
                <span className="ml-2 text-slate-800">{TYPE_LABELS[request.request_type]}</span>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Request Details</h3>

            {(request.request_type === 'mailing' || request.request_type === 'pickup') && (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500">Materials Requested:</span>
                  <div className="mt-2 border border-slate-200 rounded-lg overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-1.5 text-left text-xs font-medium text-slate-500">Item</th>
                          <th className="px-3 py-1.5 text-right text-xs font-medium text-slate-500">Requested</th>
                          <th className="px-3 py-1.5 text-right text-xs font-medium text-slate-500">In Stock</th>
                          <th className="px-3 py-1.5 text-right text-xs font-medium text-slate-500">% of Stock</th>
                          <th className="px-3 py-1.5 text-center text-xs font-medium text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materials.map((m: { itemId: string; quantity: number }, i: number) => {
                          const item = getMaterialById(m.itemId);
                          const inv = inventory.find(inv => inv.item_id === m.itemId);
                          const inStock = inv?.quantity ?? null;
                          const pct = inStock !== null && inStock > 0 ? Math.round((m.quantity / inStock) * 100) : null;
                          const isOut = inStock === 0;
                          const isInsufficient = inStock !== null && inStock > 0 && m.quantity > inStock;
                          const isHeavy = pct !== null && pct > 50;

                          return (
                            <tr key={i} className={isOut || isInsufficient ? 'bg-red-50/50' : isHeavy ? 'bg-amber-50/30' : ''}>
                              <td className="px-3 py-2 text-slate-700">{item?.nameEn || m.itemId}</td>
                              <td className="px-3 py-2 text-right font-medium text-slate-800">{m.quantity}</td>
                              <td className="px-3 py-2 text-right">
                                {inStock !== null ? (
                                  <span className={isOut ? 'text-red-600 font-medium' : 'text-slate-600'}>{inStock.toLocaleString()}</span>
                                ) : (
                                  <span className="text-slate-400 text-xs">N/A</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right">
                                {pct !== null ? (
                                  <div className="flex items-center justify-end gap-1.5">
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${pct > 100 ? 'bg-red-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                      />
                                    </div>
                                    <span className={`text-xs font-medium ${pct > 100 ? 'text-red-600' : pct > 50 ? 'text-amber-600' : 'text-slate-500'}`}>
                                      {pct > 100 ? '>100' : pct}%
                                    </span>
                                  </div>
                                ) : isOut ? (
                                  <span className="text-xs text-red-500">--</span>
                                ) : (
                                  <span className="text-xs text-slate-400">--</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isOut ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                    Out of Stock
                                  </span>
                                ) : isInsufficient ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                    Insufficient
                                  </span>
                                ) : isHeavy ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-700">
                                    High Usage
                                  </span>
                                ) : inStock !== null ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700">
                                    Available
                                  </span>
                                ) : (
                                  <span className="text-xs text-slate-400">Not tracked</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {request.request_type === 'mailing' && (
                  <>
                    <div>
                      <span className="text-slate-500">Ship To:</span>
                      <span className="ml-2 text-slate-700">{request.shipping_address}</span>
                    </div>
                    <div className="flex gap-6">
                      <div><span className="text-slate-500">State:</span> <span className="text-slate-700">{request.state}</span></div>
                      <div><span className="text-slate-500">County:</span> <span className="text-slate-700">{request.county}</span></div>
                    </div>
                  </>
                )}
                <div><span className="text-slate-500">Date Needed:</span> <span className="text-slate-700">{request.date_needed}</span></div>
              </div>
            )}

            {(request.request_type === 'in_person' || request.request_type === 'virtual') && (
              <div className="space-y-3 text-sm">
                <div className="flex gap-6">
                  <div><span className="text-slate-500">Event Date:</span> <span className="text-slate-700">{request.event_date}</span></div>
                  <div><span className="text-slate-500">Time:</span> <span className="text-slate-700">{request.start_time} - {request.end_time}</span></div>
                </div>
                {request.event_address && (
                  <div><span className="text-slate-500">Address:</span> <span className="text-slate-700">{request.event_address}</span></div>
                )}
                {request.indoor_outdoor && (
                  <div><span className="text-slate-500">Indoor/Outdoor:</span> <span className="text-slate-700 capitalize">{request.indoor_outdoor}</span></div>
                )}
                {request.parking_instructions && (
                  <div><span className="text-slate-500">Parking:</span> <span className="text-slate-700">{request.parking_instructions}</span></div>
                )}
                <div>
                  <span className="text-slate-500">Target Audience:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {audience.map((a: string) => (
                      <span key={a} className="inline-flex px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                        {getAudienceLabel(a)}
                      </span>
                    ))}
                  </div>
                </div>
                <div><span className="text-slate-500">Estimated Attendees:</span> <span className="text-slate-700 font-medium">{request.estimated_attendees}</span></div>
                <div>
                  <span className="text-slate-500">Topics:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {topics.map((t: string) => (
                      <span key={t} className="inline-flex px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded">
                        {getTopicLabel(t)}
                      </span>
                    ))}
                  </div>
                </div>
                <div><span className="text-slate-500">Requestor Attending:</span> <span className="text-slate-700">{request.requestor_attending ? 'Yes' : 'No'}</span></div>
              </div>
            )}

            {request.additional_notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-500">Additional Notes:</span>
                  {!translation && !isEnglish && (
                    <button
                      onClick={handleTranslate}
                      disabled={translating}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-700 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                      </svg>
                      {translating ? 'Translating...' : 'Translate'}
                    </button>
                  )}
                </div>

                {/* Original text */}
                <div className={translation ? 'mb-3' : ''}>
                  {translation && (
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-0.5">
                      Original ({translation.detected_language})
                    </div>
                  )}
                  <p className="text-sm text-slate-700">{request.additional_notes}</p>
                </div>

                {/* AI Translation */}
                {translation && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-md px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                        </svg>
                        <span className="text-[11px] font-medium text-blue-600 uppercase tracking-wide">
                          AI Translation
                        </span>
                      </div>
                      <button
                        onClick={() => setTranslation(null)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                        title="Dismiss translation"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-slate-700">{translation.translation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Analysis */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">AI Analysis</h3>
              <button
                onClick={() => setShowCriteria(!showCriteria)}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showCriteria ? 'Hide Criteria' : 'View Criteria'}
              </button>
            </div>

            {showCriteria && (
              <div className="mb-4 border border-slate-200 rounded-md bg-slate-50/50 p-3 space-y-2.5">
                <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Priority Assessment Criteria</p>
                {AI_PRIORITY_CRITERIA.map(c => (
                  <div key={c.id}>
                    <p className="text-xs font-semibold text-slate-700">{c.label}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wide font-medium mb-1">Final Determination</p>
                  <div className="text-xs text-slate-500 leading-relaxed space-y-0.5">
                    <p><span className="font-semibold text-red-600">Urgent:</span> Multiple high-severity factors (e.g., staff needed + event within 7 days + inventory issues)</p>
                    <p><span className="font-semibold text-orange-600">High:</span> At least one strong factor (e.g., staff needed within 14 days, inventory shortages, vulnerable population)</p>
                    <p><span className="font-semibold text-yellow-600">Medium:</span> Standard requests with moderate factors</p>
                    <p><span className="font-semibold text-slate-600">Low:</span> Simple requests with no pressing factors (e.g., mailing with stock available, flexible timeline)</p>
                  </div>
                </div>
              </div>
            )}

            {request.ai_priority ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Priority:</span>
                  <PriorityBadge priority={request.ai_priority} />
                </div>
                {request.ai_notes_analysis && (
                  <div>
                    <span className="text-slate-500">Reasoning:</span>
                    <p className="text-slate-700 mt-1 text-xs leading-relaxed bg-slate-50 rounded p-2">
                      {request.ai_notes_analysis}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Fulfillment:</span>
                  <span className="ml-2 text-slate-700 capitalize font-medium">
                    {request.ai_fulfillment_recommendation?.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Geographic Eligible:</span>
                  <span className={`ml-2 font-medium ${request.ai_geographic_eligible ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {request.ai_geographic_eligible ? 'Yes (within service area)' : 'No (outside service area)'}
                  </span>
                </div>
                {aiTags.length > 0 && (
                  <div>
                    <span className="text-slate-500">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {aiTags.map((tag: string) => (
                        <span key={tag} className="inline-flex px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded border border-blue-100">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No AI classification yet.</p>
            )}
          </div>

          {/* Inventory Check (for mailing/pickup requests) */}
          {(request.request_type === 'mailing' || request.request_type === 'pickup') && materials.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Inventory Check</h3>
              {(() => {
                const checks = materials.map((m: { itemId: string; quantity: number }) => {
                  const inv = inventory.find(inv => inv.item_id === m.itemId);
                  return { ...m, inStock: inv?.quantity ?? null };
                });
                const outOfStock = checks.filter((c: { inStock: number | null }) => c.inStock === 0);
                const insufficient = checks.filter((c: { quantity: number; inStock: number | null }) => c.inStock !== null && c.inStock > 0 && c.quantity > c.inStock);
                const totalRequested = checks.reduce((sum: number, c: { quantity: number }) => sum + c.quantity, 0);
                const canFulfill = outOfStock.length === 0 && insufficient.length === 0;

                return (
                  <div className="space-y-3">
                    {/* Overall status */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                      canFulfill ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {canFulfill ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          All items available
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                          {outOfStock.length > 0 && `${outOfStock.length} out of stock`}
                          {outOfStock.length > 0 && insufficient.length > 0 && ', '}
                          {insufficient.length > 0 && `${insufficient.length} insufficient`}
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 rounded px-2 py-1.5">
                        <div className="text-slate-500">Items Requested</div>
                        <div className="font-semibold text-slate-800">{materials.length} types</div>
                      </div>
                      <div className="bg-slate-50 rounded px-2 py-1.5">
                        <div className="text-slate-500">Total Quantity</div>
                        <div className="font-semibold text-slate-800">{totalRequested.toLocaleString()} units</div>
                      </div>
                    </div>

                    {/* Flagged items */}
                    {(outOfStock.length > 0 || insufficient.length > 0) && (
                      <div className="space-y-1.5">
                        {outOfStock.map((c: { itemId: string }) => {
                          const item = getMaterialById(c.itemId);
                          return (
                            <div key={c.itemId} className="flex items-center gap-1.5 text-xs text-red-600">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                              <span className="truncate">{item?.nameEn || c.itemId}</span>
                            </div>
                          );
                        })}
                        {insufficient.map((c: { itemId: string; quantity: number; inStock: number }) => {
                          const item = getMaterialById(c.itemId);
                          return (
                            <div key={c.itemId} className="flex items-center gap-1.5 text-xs text-amber-600">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                              <span className="truncate">{item?.nameEn || c.itemId} (need {c.quantity}, have {c.inStock})</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Admin Actions */}
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Admin Actions</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                >
                  <option value="submitted">Submitted</option>
                  <option value="in_review">In Review</option>
                  <option value="approved">Approved</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                >
                  <option value="">Not Set</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Assigned Staff</label>
                <select
                  value={assignedStaffId}
                  onChange={(e) => setAssignedStaffId(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                >
                  <option value="">Unassigned</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Fulfillment Path</label>
                <select
                  value={fulfillmentPath}
                  onChange={(e) => setFulfillmentPath(e.target.value)}
                  className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                >
                  <option value="">Not Set</option>
                  <option value="mail">Mail Materials</option>
                  <option value="staff_event">Staff Event</option>
                  <option value="virtual_staff">Virtual Staff</option>
                  <option value="pickup">Pickup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-ihc-purple focus:ring-offset-1"
                  placeholder="Internal notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} loading={saving} className="flex-1">
                  Save Changes
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
