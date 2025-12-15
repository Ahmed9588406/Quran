/**
 * Chat Mark Seen API Route
 * 
 * POST /api/chats/[chatId]/seen - Mark messages as seen
 * Body: { "message_id": "optional_message_id" }
 * 
 * Backend endpoint: POST /chat/:chat_id/seen
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/chats/[chatId]/seen - Mark messages as seen
 * 
 * Marks messages in a chat as seen/read.
 * Body: { "message_id": "optional_specific_message_id" }
 * If no message_id provided, marks all messages as seen.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    const response = await fetch(`${BASE_URL}/chat/${chatId}/seen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend seen error:', response.status, text);
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error marking messages as seen:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as seen' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
