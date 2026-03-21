import { NextRequest, NextResponse } from 'next/server';
import { getRequestById, updateRequest, getAllInventory } from '@/lib/db';
import { classifyRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing request ID' }, { status: 400 });
    }

    const row = getRequestById(id);
    if (!row) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Fetch inventory so the AI can assess material availability
    const inventory = getAllInventory().map(i => ({
      item_id: i.item_id || '',
      name: i.name,
      quantity: i.quantity,
      low_stock_threshold: i.low_stock_threshold,
    }));

    const classification = await classifyRequest(row, inventory);

    updateRequest(id, {
      ai_priority: classification.priority,
      ai_tags: JSON.stringify(classification.tags),
      ai_fulfillment_recommendation: classification.fulfillment_recommendation,
      ai_notes_analysis: classification.notes_analysis || undefined,
      ai_geographic_eligible: classification.geographic_eligible ? 1 : 0,
    } as Record<string, unknown>);

    const updated = getRequestById(id);
    return NextResponse.json({ classification, request: updated });
  } catch (error) {
    console.error('Error classifying request:', error);
    return NextResponse.json({ error: 'Failed to classify request' }, { status: 500 });
  }
}
