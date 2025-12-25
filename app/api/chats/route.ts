/**
 * Chat List and Create API Routes
 * 
 * GET - List all chats for the current user
 * POST - Create a new direct chat
 * 
 * Requirements: 1.1, 2.2
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://apisoapp.twingroups.com';

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
 * GET /api/chats - List all chats
 */
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';

    const response = await fetch(`${BASE_URL}/chat/list`, {
      method: 'GET',
      headers: {
        ...(auth ? { Authorization: auth } : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data.chats || data, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * POST /api/chats - Create a new direct chat
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    const response = await fetch(`${BASE_URL}/chat/create`, {
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
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
