'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ScatterChart, Scatter, ZAxis, ComposedChart, Line,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import type { RequestRow } from '@/lib/db';
import { MATERIAL_CATEGORIES } from '@/lib/materials';
import { TOPICS, TARGET_AUDIENCES } from '@/lib/constants';

interface AnalyticsTabProps {
  requests: RequestRow[];
}

const STATUS_COLORS: Record<string, string> = {
  submitted: '#9988f0',
  in_review: '#f59e0b',
  approved: '#00857c',
  fulfilled: '#110057',
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  fulfilled: 'Fulfilled',
};

const TYPE_LABELS: Record<string, string> = {
  mailing: 'Mailing',
  in_person: 'In-Person',
  virtual: 'Virtual',
  pickup: 'Pickup',
};

const TYPE_COLORS: Record<string, string> = {
  mailing: '#4a00e2',
  in_person: '#00857c',
  virtual: '#bf00e6',
  pickup: '#f59e0b',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#eab308',
  high: '#f97316',
  urgent: '#ef4444',
};

// Helper: get resource categories from a request
function getResourceCategories(r: RequestRow): string[] {
  if (r.request_type === 'mailing' || r.request_type === 'pickup') {
    if (!r.materials) return [];
    try {
      const mats = JSON.parse(r.materials) as { itemId: string }[];
      const catIds = new Set<string>();
      for (const m of mats) {
        const cat = MATERIAL_CATEGORIES.find(c => c.items.some(i => i.id === m.itemId));
        if (cat) catIds.add(cat.nameEn);
      }
      return Array.from(catIds);
    } catch { return []; }
  }
  if (r.request_type === 'in_person' || r.request_type === 'virtual') {
    if (!r.topics) return [];
    try {
      const topicIds = JSON.parse(r.topics) as string[];
      return topicIds.map(id => {
        const t = TOPICS.find(t => t.id === id);
        return t ? t.en : id;
      });
    } catch { return []; }
  }
  return [];
}

// Helper: get audiences from a request
function getAudiences(r: RequestRow): string[] {
  if (!r.target_audience) return [];
  try {
    const ids = JSON.parse(r.target_audience) as string[];
    return ids.map(id => {
      const a = TARGET_AUDIENCES.find(a => a.id === id);
      return a ? a.en : id;
    });
  } catch { return []; }
}

// Short labels for resource categories
const SHORT_RESOURCE: Record<string, string> = {
  'Car Seat Safety': 'Car Seats',
  'Spot the Tot & Forget Me Not': 'Spot the Tot',
  'Window Falls Prevention': 'Window Falls',
  'Helmet Safety': 'Helmets',
  'Wear Your Helmet': 'Helmets',
  'ATV Safety': 'ATV Safety',
  'Water Safety': 'Water Safety',
  'Pedestrian Safety': 'Pedestrian',
  'Emotional Wellbeing': 'Emotional Well.',
  'Firearm Safety': 'Firearms',
  'Vaping Prevention': 'Vaping',
  'Window Fall Prevention': 'Window Falls',
  'Spot the Tot / Hot Cars Forget Me Not': 'Spot the Tot',
};

function shorten(label: string): string {
  return SHORT_RESOURCE[label] || label;
}

export default function AnalyticsTab({ requests }: AnalyticsTabProps) {
  const analytics = useMemo(() => {
    // ===== BASIC COUNTS =====
    const statusCounts = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      fill: STATUS_COLORS[status] || '#94a3b8',
    }));

    const typeCounts = requests.reduce((acc, r) => {
      acc[r.request_type] = (acc[r.request_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeData = Object.entries(typeCounts).map(([type, count]) => ({
      name: TYPE_LABELS[type] || type,
      count,
      fill: TYPE_COLORS[type] || '#94a3b8',
    }));

    // ===== RESOURCE CATEGORY FREQUENCY =====
    const resourceCounts: Record<string, number> = {};
    requests.forEach(r => {
      getResourceCategories(r).forEach(cat => {
        const key = shorten(cat);
        resourceCounts[key] = (resourceCounts[key] || 0) + 1;
      });
    });
    const resourceData = Object.entries(resourceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    // ===== RESOURCE × TYPE CROSS-TAB (Heatmap data) =====
    const crossTab: Record<string, Record<string, number>> = {};
    requests.forEach(r => {
      const type = TYPE_LABELS[r.request_type] || r.request_type;
      getResourceCategories(r).forEach(cat => {
        const key = shorten(cat);
        if (!crossTab[key]) crossTab[key] = {};
        crossTab[key][type] = (crossTab[key][type] || 0) + 1;
      });
    });

    // Build stacked bar data: each resource category with counts per type
    const allTypes = Object.values(TYPE_LABELS);
    const crossTabData = Object.entries(crossTab)
      .sort((a, b) => {
        const totalA = Object.values(a[1]).reduce((s, v) => s + v, 0);
        const totalB = Object.values(b[1]).reduce((s, v) => s + v, 0);
        return totalB - totalA;
      })
      .map(([resource, types]) => ({
        resource,
        ...Object.fromEntries(allTypes.map(t => [t, types[t] || 0])),
      }));

    // ===== AUDIENCE BREAKDOWN =====
    const audienceCounts: Record<string, number> = {};
    requests.forEach(r => {
      getAudiences(r).forEach(a => {
        audienceCounts[a] = (audienceCounts[a] || 0) + 1;
      });
    });
    const audienceData = Object.entries(audienceCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, fullMark: Math.max(...Object.values(audienceCounts)) }));

    // ===== PRIORITY × TYPE =====
    const priorityByType: Record<string, Record<string, number>> = {};
    requests.forEach(r => {
      const type = TYPE_LABELS[r.request_type] || r.request_type;
      const priority = r.ai_priority || 'unclassified';
      if (!priorityByType[type]) priorityByType[type] = {};
      priorityByType[type][priority] = (priorityByType[type][priority] || 0) + 1;
    });
    const priorityTypeData = Object.entries(priorityByType).map(([type, priorities]) => ({
      type,
      ...priorities,
    }));

    // ===== GEOGRAPHIC =====
    const geoCounts: Record<string, number> = {};
    requests.forEach(r => {
      const location = r.county || r.state || 'Unknown';
      if (location !== 'Unknown') {
        geoCounts[location] = (geoCounts[location] || 0) + 1;
      }
    });
    const geoData = Object.entries(geoCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ===== EVENT SIZE SCATTER (attendees vs resources per request) =====
    const scatterData = requests
      .filter(r => r.estimated_attendees && r.estimated_attendees > 0)
      .map(r => ({
        name: r.organization,
        attendees: r.estimated_attendees!,
        resources: getResourceCategories(r).length,
        type: TYPE_LABELS[r.request_type] || r.request_type,
        priority: r.ai_priority || 'medium',
      }));

    // ===== REGRESSION LINE for scatter plot =====
    let regressionLine: { resources: number; attendees: number }[] = [];
    if (scatterData.length >= 2) {
      const n = scatterData.length;
      const sumX = scatterData.reduce((s, d) => s + d.resources, 0);
      const sumY = scatterData.reduce((s, d) => s + d.attendees, 0);
      const sumXY = scatterData.reduce((s, d) => s + d.resources * d.attendees, 0);
      const sumX2 = scatterData.reduce((s, d) => s + d.resources * d.resources, 0);
      const denom = n * sumX2 - sumX * sumX;
      if (denom !== 0) {
        const slope = (n * sumXY - sumX * sumY) / denom;
        const intercept = (sumY - slope * sumX) / n;
        const minX = Math.min(...scatterData.map(d => d.resources));
        const maxX = Math.max(...scatterData.map(d => d.resources));
        regressionLine = [
          { resources: minX, attendees: Math.round(slope * minX + intercept) },
          { resources: maxX, attendees: Math.round(slope * maxX + intercept) },
        ];
      }
    }

    // ===== TURNAROUND TIME (days from submission to fulfillment) =====
    const turnaroundData: { name: string; days: number; type: string }[] = [];
    requests
      .filter(r => r.status === 'fulfilled' && r.approved_at)
      .forEach(r => {
        const created = new Date(r.created_at + 'Z');
        const approved = new Date(r.approved_at + 'Z');
        const days = Math.max(0, Math.round((approved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
        turnaroundData.push({
          name: r.organization,
          days,
          type: TYPE_LABELS[r.request_type] || r.request_type,
        });
      });

    // ===== IN-STATE vs OUT-OF-STATE =====
    const inState = requests.filter(r => r.state === 'Utah' || r.ai_geographic_eligible === 1).length;
    const outOfState = requests.filter(r => r.state && r.state !== 'Utah').length;
    const noState = requests.length - inState - outOfState;

    // ===== STAFFING ESTIMATE =====
    const staffEvents = requests.filter(r =>
      (r.request_type === 'in_person' || r.request_type === 'virtual') &&
      r.status !== 'fulfilled'
    );
    const totalExpectedAttendees = staffEvents.reduce((sum, r) => sum + (r.estimated_attendees || 0), 0);
    const avgAttendees = staffEvents.length > 0 ? Math.round(totalExpectedAttendees / staffEvents.length) : 0;

    // ===== SUMMARY STATS =====
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'submitted' || r.status === 'in_review').length;
    const urgentRequests = requests.filter(r => r.ai_priority === 'urgent' || r.ai_priority === 'high').length;
    const thisMonthRequests = requests.filter(r => {
      const created = r.created_at.substring(0, 7);
      const currentMonth = new Date().toISOString().substring(0, 7);
      return created === currentMonth;
    }).length;
    const fulfillmentRate = requests.length > 0
      ? Math.round((requests.filter(r => r.status === 'fulfilled').length / requests.length) * 100)
      : 0;
    const avgTurnaround = turnaroundData.length > 0
      ? (turnaroundData.reduce((s, d) => s + d.days, 0) / turnaroundData.length).toFixed(1)
      : '--';

    // ===== UPCOMING EVENTS =====
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = requests
      .filter(r => (r.request_type === 'in_person' || r.request_type === 'virtual') && r.event_date && r.event_date >= today)
      .sort((a, b) => (a.event_date || '').localeCompare(b.event_date || ''))
      .slice(0, 8);

    // ===== SPANISH MATERIALS DEMAND =====
    let spanishItems = 0;
    let englishItems = 0;
    requests.forEach(r => {
      if (!r.materials) return;
      try {
        const mats = JSON.parse(r.materials) as { itemId: string; quantity: number }[];
        mats.forEach(m => {
          if (m.itemId.endsWith('_es')) spanishItems += m.quantity;
          else englishItems += m.quantity;
        });
      } catch { /* ignore */ }
    });

    return {
      statusData, typeData, resourceData, crossTabData, allTypes, audienceData,
      priorityTypeData, geoData, scatterData, regressionLine, turnaroundData,
      inState, outOfState, noState,
      staffEvents: staffEvents.length, totalExpectedAttendees, avgAttendees,
      totalRequests, pendingRequests, urgentRequests, thisMonthRequests,
      fulfillmentRate, avgTurnaround, upcomingEvents,
      spanishItems, englishItems,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Summary Cards — Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: analytics.totalRequests, sub: `${analytics.thisMonthRequests} this month` },
          { label: 'Pending Review', value: analytics.pendingRequests, sub: `${analytics.urgentRequests} high/urgent`, alert: analytics.urgentRequests > 0 },
          { label: 'Fulfillment Rate', value: `${analytics.fulfillmentRate}%`, sub: `Avg ${analytics.avgTurnaround} days to approve` },
          { label: 'Upcoming Events', value: analytics.staffEvents, sub: `${analytics.totalExpectedAttendees.toLocaleString()} expected attendees` },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-lg p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.alert ? 'text-amber-600' : 'text-slate-800'}`}>
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Row 2: Status + Type side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status Distribution</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie data={analytics.statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={false} labelLine={false}>
                  {analytics.statusData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {analytics.statusData.map(entry => (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: entry.fill }} />
                    <span className="text-slate-600">{entry.name}</span>
                  </div>
                  <span className="font-medium text-slate-800">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Requests by Type — colored bars */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Requests by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {analytics.typeData.map((entry, i) => (
                  <Cell key={`type-${i}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Resource × Type Cross-Tab (KEY INSIGHT) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-700">Resource Categories × Request Type</h3>
          <span className="text-[11px] text-slate-400">Which resources are requested through which channels</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Insight: Identifies which fulfillment channels each resource category flows through — helps optimize stocking and staffing.
        </p>
        <ResponsiveContainer width="100%" height={Math.max(250, analytics.crossTabData.length * 36)}>
          <BarChart data={analytics.crossTabData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
            <YAxis dataKey="resource" type="category" tick={{ fontSize: 11, fill: '#475569' }} width={110} />
            <Tooltip />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            {analytics.allTypes.map(type => (
              <Bar key={type} dataKey={type} stackId="a" fill={TYPE_COLORS[Object.entries(TYPE_LABELS).find(([, v]) => v === type)?.[0] || ''] || '#94a3b8'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 4: Most Requested Resources + Priority by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Requested Resource Categories */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Most Requested Resources</h3>
          <p className="text-xs text-slate-500 mb-4">
            Total requests mentioning each resource category
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.resourceData} margin={{ bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b', angle: -35, dy: 8 }} height={80} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority × Request Type */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Priority Level by Request Type</h3>
          <p className="text-xs text-slate-500 mb-4">
            Insight: In-person events skew high/urgent due to staffing needs and deadlines.
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.priorityTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="low" stackId="a" fill={PRIORITY_COLORS.low} name="Low" />
              <Bar dataKey="medium" stackId="a" fill={PRIORITY_COLORS.medium} name="Medium" />
              <Bar dataKey="high" stackId="a" fill={PRIORITY_COLORS.high} name="High" />
              <Bar dataKey="urgent" stackId="a" fill={PRIORITY_COLORS.urgent} name="Urgent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 5: Audience Radar + Language Demand + Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audience Radar */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Target Audience Profile</h3>
          <p className="text-xs text-slate-500 mb-3">Who are requests serving?</p>
          {analytics.audienceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart outerRadius={80} data={analytics.audienceData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar dataKey="count" stroke="#0d9488" fill="#0d9488" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">No audience data available.</p>
          )}
        </div>

        {/* Language Demand */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Material Language Demand</h3>
          <p className="text-xs text-slate-500 mb-3">Units requested by language</p>
          <div className="flex items-center justify-center h-[220px]">
            {analytics.spanishItems + analytics.englishItems > 0 ? (
              <div className="w-full">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart margin={{ top: 20, bottom: 10 }}>
                    <Pie
                      data={[
                        { name: 'English', value: analytics.englishItems, fill: '#4a00e2' },
                        { name: 'Spanish', value: analytics.spanishItems, fill: '#f59e0b' },
                      ]}
                      cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}
                    >
                      <Cell fill="#4a00e2" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 text-xs text-slate-600 mt-1">
                  <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-ihc-purple mr-1" />{analytics.englishItems.toLocaleString()} English</span>
                  <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500 mr-1" />{analytics.spanishItems.toLocaleString()} Spanish</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No material data.</p>
            )}
          </div>
        </div>

        {/* Geographic + In/Out State */}
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Service Area Coverage</h3>
          <p className="text-xs text-slate-500 mb-3">In-state vs out-of-state requests</p>
          <div className="space-y-3 mt-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>In-State (Utah)</span>
                <span className="font-medium">{analytics.inState} ({analytics.totalRequests > 0 ? Math.round(analytics.inState / analytics.totalRequests * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analytics.totalRequests > 0 ? (analytics.inState / analytics.totalRequests * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>Out-of-State</span>
                <span className="font-medium">{analytics.outOfState} ({analytics.totalRequests > 0 ? Math.round(analytics.outOfState / analytics.totalRequests * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-ihc-light rounded-full" style={{ width: `${analytics.totalRequests > 0 ? (analytics.outOfState / analytics.totalRequests * 100) : 0}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Top Locations</h4>
              {analytics.geoData.slice(0, 5).map((g, i) => (
                <div key={g.name} className="flex items-center justify-between py-1 text-xs">
                  <span className="text-slate-600"><span className="text-slate-400 mr-1.5">{i + 1}.</span>{g.name}</span>
                  <span className="font-medium text-slate-700">{g.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 6: Event Scale Scatter Plot */}
      {analytics.scatterData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-700">Event Scale: Attendees vs Resource Complexity</h3>
            <span className="text-[11px] text-slate-400">Bubble size = attendees</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Insight: Larger events tend to cover more topic areas — plan multi-staff teams for high-complexity events.
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" dataKey="resources" name="Topics/Resources" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Number of Topics', position: 'bottom', offset: 0, fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="number" dataKey="attendees" name="Attendees" tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Expected Attendees', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
              <ZAxis type="number" dataKey="attendees" range={[40, 400]} />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-slate-800">{d.name}</p>
                      <p className="text-slate-500">{d.type} · {d.priority} priority</p>
                      <p className="text-slate-600 mt-1">{d.attendees} attendees · {d.resources} topics</p>
                    </div>
                  );
                }}
              />
              <Scatter data={analytics.scatterData} fill="#0d9488" fillOpacity={0.6} />
              {analytics.regressionLine.length === 2 && (
                <Line
                  data={analytics.regressionLine}
                  dataKey="attendees"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  name="Trend"
                  legendType="line"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
          {analytics.regressionLine.length === 2 && (
            <p className="text-[11px] text-slate-400 mt-1 text-right">
              <span className="inline-block w-4 border-t-2 border-dashed border-orange-400 mr-1 align-middle" />
              Regression trend line
            </p>
          )}
        </div>
      )}

      {/* Row 7: Key Insights Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Dynamically generate insights */}
          {analytics.resourceData.length > 0 && (
            <div className="bg-white rounded-md px-3 py-2.5 border border-slate-100">
              <p className="text-xs font-medium text-slate-700">Top Requested Resource</p>
              <p className="text-sm text-slate-600 mt-0.5">
                <span className="font-semibold text-teal-700">{analytics.resourceData[0].name}</span> appears in {analytics.resourceData[0].count} requests ({Math.round(analytics.resourceData[0].count / analytics.totalRequests * 100)}% of all)
              </p>
            </div>
          )}
          {analytics.spanishItems + analytics.englishItems > 0 && (
            <div className="bg-white rounded-md px-3 py-2.5 border border-slate-100">
              <p className="text-xs font-medium text-slate-700">Spanish Material Demand</p>
              <p className="text-sm text-slate-600 mt-0.5">
                <span className="font-semibold text-amber-600">{Math.round(analytics.spanishItems / (analytics.spanishItems + analytics.englishItems) * 100)}%</span> of material units requested are in Spanish ({analytics.spanishItems.toLocaleString()} units)
              </p>
            </div>
          )}
          <div className="bg-white rounded-md px-3 py-2.5 border border-slate-100">
            <p className="text-xs font-medium text-slate-700">Staffing Load</p>
            <p className="text-sm text-slate-600 mt-0.5">
              <span className="font-semibold text-ihc-purple">{analytics.staffEvents}</span> upcoming events need staff, averaging <span className="font-semibold">{analytics.avgAttendees}</span> attendees each
            </p>
          </div>
          {analytics.urgentRequests > 0 && (
            <div className="bg-white rounded-md px-3 py-2.5 border border-amber-100">
              <p className="text-xs font-medium text-slate-700">Action Needed</p>
              <p className="text-sm text-slate-600 mt-0.5">
                <span className="font-semibold text-red-600">{analytics.urgentRequests}</span> requests are high/urgent priority and <span className="font-semibold">{analytics.pendingRequests}</span> are still pending review
              </p>
            </div>
          )}
          {analytics.outOfState > 0 && (
            <div className="bg-white rounded-md px-3 py-2.5 border border-slate-100">
              <p className="text-xs font-medium text-slate-700">Geographic Reach</p>
              <p className="text-sm text-slate-600 mt-0.5">
                <span className="font-semibold">{analytics.outOfState}</span> out-of-state request{analytics.outOfState > 1 ? 's' : ''} — mailing-only fulfillment (no staff support)
              </p>
            </div>
          )}
          <div className="bg-white rounded-md px-3 py-2.5 border border-slate-100">
            <p className="text-xs font-medium text-slate-700">Processing Speed</p>
            <p className="text-sm text-slate-600 mt-0.5">
              Average <span className="font-semibold text-teal-700">{analytics.avgTurnaround}</span> days from submission to approval for fulfilled requests
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Upcoming Events</h3>
        {analytics.upcomingEvents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-slate-200 text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="pb-2 pr-3 w-[100px]">Date</th>
                  <th className="pb-2 pr-3 w-[140px]">Organization</th>
                  <th className="pb-2 pr-3 w-[70px]">Type</th>
                  <th className="pb-2 pr-3">Location</th>
                  <th className="pb-2 pr-3 w-[80px]">Attendees</th>
                  <th className="pb-2 w-[90px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.upcomingEvents.map(event => (
                  <tr key={event.id}>
                    <td className="py-2 pr-3 text-slate-700 whitespace-nowrap">{event.event_date}</td>
                    <td className="py-2 pr-3 text-slate-700 truncate">{event.organization}</td>
                    <td className="py-2 pr-3 text-slate-600 capitalize">{event.request_type.replace('_', ' ')}</td>
                    <td className="py-2 pr-3 text-slate-600 truncate">{event.event_address || 'Virtual'}</td>
                    <td className="py-2 pr-3 text-slate-600">{event.estimated_attendees || '--'}</td>
                    <td className="py-2"><StatusBadge status={event.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No upcoming events.</p>
        )}
      </div>
    </div>
  );
}
