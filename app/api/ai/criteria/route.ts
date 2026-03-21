import { NextResponse } from 'next/server';
import { AI_PRIORITY_CRITERIA, AI_SYSTEM_PROMPT } from '@/lib/ai';

export async function GET() {
  return NextResponse.json({
    criteria: AI_PRIORITY_CRITERIA,
    prompt: AI_SYSTEM_PROMPT,
  });
}
