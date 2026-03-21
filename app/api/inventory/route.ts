import { NextRequest, NextResponse } from 'next/server';
import { getAllInventory, createInventoryItem } from '@/lib/db';

export async function GET() {
  try {
    const items = getAllInventory();
    return NextResponse.json(items);
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const item = createInventoryItem({
      item_id: body.item_id,
      name: body.name,
      category: body.category,
      quantity: body.quantity ?? 0,
      low_stock_threshold: body.low_stock_threshold,
      unit: body.unit,
      notes: body.notes,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
