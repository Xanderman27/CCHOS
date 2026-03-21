import { NextRequest, NextResponse } from 'next/server';
import { getAllRequests, createRequest } from '@/lib/db';
import { classifyRequest } from '@/lib/ai';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      request_type: searchParams.get('request_type') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const requests = getAllRequests(filters);
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.organization || !body.email || !body.request_type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, organization, email, request_type' },
        { status: 400 }
      );
    }

    // Create the request
    const newRequest = createRequest(body);

    // Run AI classification with inventory context
    try {
      const { getAllInventory } = await import('@/lib/db');
      const inventory = getAllInventory().map(i => ({
        item_id: i.item_id || '',
        name: i.name,
        quantity: i.quantity,
        low_stock_threshold: i.low_stock_threshold,
      }));
      const classification = await classifyRequest(newRequest, inventory);

      // Update with AI results
      const { updateRequest } = await import('@/lib/db');
      updateRequest(newRequest.id, {
        ai_priority: classification.priority,
        ai_tags: JSON.stringify(classification.tags),
        ai_fulfillment_recommendation: classification.fulfillment_recommendation,
        ai_notes_analysis: classification.notes_analysis || undefined,
        ai_geographic_eligible: classification.geographic_eligible ? 1 : 0,
      } as Partial<typeof newRequest>);
    } catch (aiError) {
      console.error('AI classification failed:', aiError);
      // Request was still created, just without AI classification
    }

    // Return the latest version
    const { getRequestById } = await import('@/lib/db');
    const result = getRequestById(newRequest.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
