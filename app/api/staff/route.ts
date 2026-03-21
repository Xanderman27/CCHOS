import { NextRequest, NextResponse } from 'next/server';
import { getAllStaff, createStaffMember } from '@/lib/db';
import { seedStaff } from '@/lib/seed-staff';

export async function GET() {
  try {
    seedStaff();
    const staff = getAllStaff();
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const member = createStaffMember(body);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}
