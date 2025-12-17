/**
 * Group Members API Routes
 * 
 * POST - Add a member to a group
 * DELETE - Remove a member from a group
 * 
 * Requirements: 8.4, 8.5
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/chats/[chatId]/members - Add a member
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    const response = await fetch(`${BASE_URL}/chat/group/${chatId}/add`, {
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
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json(
      { error: 'Failed to add member' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

/**
 * DELETE /api/chats/[chatId]/members - Remove a member
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    const response = await fetch(`${BASE_URL}/chat/group/${chatId}/remove`, {
      method: 'DELETE',
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
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
