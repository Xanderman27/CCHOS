import { NextRequest, NextResponse } from 'next/server';
import { getAllRequests } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const status = searchParams.get('status') || undefined;

    const requests = getAllRequests({ status });

    if (format === 'csv') {
      const headers = [
        'ID', 'Created', 'Status', 'Name', 'Organization', 'Email',
        'Request Type', 'Event Date', 'Event Address', 'Estimated Attendees',
        'Topics', 'Materials', 'State', 'County', 'AI Priority',
        'AI Recommendation', 'Admin Notes', 'Fulfillment Path',
      ];

      const rows = requests.map(r => [
        r.id,
        r.created_at,
        r.status,
        `"${(r.name || '').replace(/"/g, '""')}"`,
        `"${(r.organization || '').replace(/"/g, '""')}"`,
        r.email,
        r.request_type,
        r.event_date || r.date_needed || '',
        `"${(r.event_address || r.shipping_address || '').replace(/"/g, '""')}"`,
        r.estimated_attendees || '',
        `"${(r.topics || '').replace(/"/g, '""')}"`,
        `"${(r.materials || '').replace(/"/g, '""')}"`,
        r.state || '',
        r.county || '',
        r.ai_priority || '',
        r.ai_fulfillment_recommendation || '',
        `"${(r.admin_notes || '').replace(/"/g, '""')}"`,
        r.fulfillment_path || '',
      ].join(','));

      const csv = [headers.join(','), ...rows].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="cch-requests-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error exporting requests:', error);
    return NextResponse.json({ error: 'Failed to export requests' }, { status: 500 });
  }
}
