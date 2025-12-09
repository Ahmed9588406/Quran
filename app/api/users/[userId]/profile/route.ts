import { NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendRes = await fetch(`${BASE_URL}/users/${userId}/profile`, {
      method: 'GET',
      headers,
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch user profile' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize avatar URL
    if (data?.user?.avatar_url && typeof data.user.avatar_url === 'string' && data.user.avatar_url.startsWith('/')) {
      data.user.avatar_url = `${BASE_URL}${data.user.avatar_url}`;
    }
    if (data?.avatar_url && typeof data.avatar_url === 'string' && data.avatar_url.startsWith('/')) {
      data.avatar_url = `${BASE_URL}${data.avatar_url}`;
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('User profile proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
