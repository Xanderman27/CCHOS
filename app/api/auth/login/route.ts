import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, verifyPassword, ensureDefaultAdmin } from '@/lib/users';
import { createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Ensure default admin exists on first login attempt
    ensureDefaultAdmin();

    const user = getUserByUsername(username);
    if (!user || !verifyPassword(user, password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    await createSession(user.id, user.username, user.display_name);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
