import { NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function getCookieFromHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(';').map(p => p.trim());
  for (const p of pairs) {
    const [k, ...v] = p.split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  // Get token from Authorization header or cookies
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  let token: string | null = null;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    const cookieHeader = request.headers.get('cookie');
    token = getCookieFromHeader(cookieHeader, 'accessToken') ?? null;
  }

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders() });
  }

  // Get userId from query params
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders() });
  }

  try {
    const type = url.searchParams.get('type');
    
    // If type=posts, fetch user posts instead of profile
    if (type === 'posts') {
      const limit = url.searchParams.get('limit') || '20';
      const page = url.searchParams.get('page') || '1';
      
      const backendRes = await fetch(
        `${BASE_URL}/users/${encodeURIComponent(userId)}/posts?limit=${limit}&page=${page}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await backendRes.json().catch(() => null);

      if (!backendRes.ok) {
        return NextResponse.json(data ?? { error: 'Failed to fetch posts' }, {
          status: backendRes.status,
          headers: corsHeaders(),
        });
      }

      return NextResponse.json(data, { status: 200, headers: corsHeaders() });
    }

    // Fetch user profile from backend: GET /users/{userId}
    const backendRes = await fetch(`${BASE_URL}/users/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch user' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize avatar_url and cover_url if relative
    if (data?.user) {
      if (typeof data.user.avatar_url === 'string' && data.user.avatar_url.startsWith('/')) {
        data.user.avatar_url = `${BASE_URL}${data.user.avatar_url}`;
      }
      if (typeof data.user.cover_url === 'string' && data.user.cover_url?.startsWith('/')) {
        data.user.cover_url = `${BASE_URL}${data.user.cover_url}`;
      }
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('User profile proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
