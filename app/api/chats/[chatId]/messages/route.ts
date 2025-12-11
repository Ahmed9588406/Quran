/**
 * Chat Messages API Routes
 * 
 * GET - Get messages for a chat: /chat/:chat_id/messages?limit=50
 * POST - Send a new message
 * 
 * Requirements: 3.1, 6.3, 10.2
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * GET /api/chats/[chatId]/messages - Get messages
 * Backend endpoint: /chat/:chat_id/messages?limit=50
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const { searchParams } = new URL(req.url);
    
    // Build query string - default limit to 50
    const queryParams = new URLSearchParams();
    const limit = searchParams.get('limit') || '50';
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');
    
    queryParams.append('limit', limit);
    if (filter) queryParams.append('filter', filter);
    if (search) queryParams.append('search', search);

    // Backend endpoint: /chat/:chat_id/messages?limit=50
    const url = `${BASE_URL}/chat/${chatId}/messages?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Backend error:', response.status, text);
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    
    // Return messages array - handle both { messages: [...] } and direct array response
    const messages = data.messages || data;
    return NextResponse.json(messages, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * POST /api/chats/[chatId]/messages - Send a message
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    const response = await fetch(`${BASE_URL}/chat/${chatId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 201,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
