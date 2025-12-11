/**
 * Group Chat Creation API Route
 * 
 * POST - Create a new group chat
 * 
 * Requirements: 8.1
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
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/chats/group - Create a group chat
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    const response = await fetch(`${BASE_URL}/chat/group/create`, {
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
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
