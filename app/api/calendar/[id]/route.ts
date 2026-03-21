import { NextRequest, NextResponse } from 'next/server';
import { getRequestById } from '@/lib/db';
import { generateCalendarInvite } from '@/lib/calendar';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const requestId = parseInt(id);
    if (isNaN(requestId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const row = getRequestById(requestId);
    if (!row) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (row.request_type === 'mailing') {
      return NextResponse.json({ error: 'Calendar invites are only for event requests' }, { status: 400 });
    }

    const icsContent = generateCalendarInvite(row);

    return new NextResponse(icsContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="cch-event-${requestId}.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating calendar invite:', error);
    return NextResponse.json({ error: 'Failed to generate calendar invite' }, { status: 500 });
  }
}
