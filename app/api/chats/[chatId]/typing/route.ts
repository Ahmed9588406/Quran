/**
 * Chat Typing Indicator API Route
 * 
 * POST /api/chats/[chatId]/typing - Send typing indicator
 * Body: { "is_typing": true/false }
 * 
 * Backend endpoint: POST /chat/:chat_id/typing
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';

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
 * POST /api/chats/[chatId]/typing - Send typing indicator
 * 
 * Sends typing indicator to the backend.
 * Body: { "is_typing": true }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    // Validate body
    if (typeof body.is_typing !== 'boolean') {
      return NextResponse.json(
        { error: 'is_typing must be a boolean' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const response = await fetch(`${BASE_URL}/chat/${chatId}/typing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ is_typing: body.is_typing }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend typing error:', response.status, text);
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
    console.error('Error sending typing indicator:', error);
    return NextResponse.json(
      { error: 'Failed to send typing indicator' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
