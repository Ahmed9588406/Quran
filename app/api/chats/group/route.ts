/**
 * Group Chat Creation API Route
 * 
 * POST - Create a new group chat
 * Endpoint: POST /chat/group
 * Body: { "title": "Group Name", "members": ["USER_ID_1", "USER_ID_2"] }
 * 
 * Requirements: 8.1
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://apisoapp.twingroups.com';

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
 * 
 * Request body:
 * {
 *   "title": "My Group Chat",
 *   "members": ["USER_ID_1", "USER_ID_2"]
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "chat_id": "generated_chat_id"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    // Validate request body
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!body.members || !Array.isArray(body.members) || body.members.length === 0) {
      return NextResponse.json(
        { error: 'Members array is required and must contain at least one user ID' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const response = await fetch(`${BASE_URL}/chat/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({
        title: body.title,
        members: body.members,
      }),
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
