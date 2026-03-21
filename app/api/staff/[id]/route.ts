import { NextRequest, NextResponse } from 'next/server';
import { getStaffById, updateStaffMember, deleteStaffMember } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const member = getStaffById(staffId);
    if (!member) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    return NextResponse.json({ error: 'Failed to fetch staff member' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await request.json();
    const updated = updateStaffMember(staffId, body);
    if (!updated) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    if (isNaN(staffId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const deleted = deleteStaffMember(staffId);
    if (!deleted) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
