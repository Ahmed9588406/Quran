import { NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

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

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendRes = await fetch(`${BASE_URL}/feed/suggested`, {
      method: 'GET',
      headers,
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch suggested users' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize avatar URLs
    if (data?.suggested_users && Array.isArray(data.suggested_users)) {
      data.suggested_users = data.suggested_users.map((user: Record<string, unknown>) => {
        const normalized = { ...user };
        if (typeof user.avatar_url === 'string' && user.avatar_url.startsWith('/')) {
          normalized.avatar_url = `${BASE_URL}${user.avatar_url}`;
        }
        return normalized;
      });
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Suggested users proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
