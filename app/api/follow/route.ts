import { NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// Follow a user
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders() });
    }

    const backendRes = await fetch(`${BASE_URL}/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await backendRes.json().catch(() => null);

    return NextResponse.json(data ?? { success: backendRes.ok }, {
      status: backendRes.status,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error('Follow proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}

// Unfollow a user
export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders() });
    }

    const backendRes = await fetch(`${BASE_URL}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await backendRes.json().catch(() => null);

    return NextResponse.json(data ?? { success: backendRes.ok }, {
      status: backendRes.status,
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error('Unfollow proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
