import { NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';

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

  // Get userId, limit, and page from query params
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const limit = url.searchParams.get('limit') || '20';
  const page = url.searchParams.get('page') || '1';

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400, headers: corsHeaders() });
  }

  try {
    // Fetch user photos from backend: GET /users/{user_id}/photos?limit=20&page=1
    const backendRes = await fetch(
      `${BASE_URL}/users/${encodeURIComponent(userId)}/photos?limit=${limit}&page=${page}`,
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
      return NextResponse.json(data ?? { error: 'Failed to fetch photos' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize photo_url field if relative (handles /uploads paths)
    // Response shape: { success: true, photos: [{ post_id, photo_url, created_at, media_type }], pagination }
    if (data?.photos && Array.isArray(data.photos)) {
      data.photos = data.photos.map((photo: { photo_url?: string; avatar_url?: string; [key: string]: unknown }) => {
        const normalized = { ...photo };
        if (typeof photo.photo_url === 'string' && photo.photo_url.startsWith('/')) {
          normalized.photo_url = `${BASE_URL}${photo.photo_url}`;
        }
        if (typeof photo.avatar_url === 'string' && photo.avatar_url.startsWith('/')) {
          normalized.avatar_url = `${BASE_URL}${photo.avatar_url}`;
        }
        return normalized;
      });
    }

    // Normalize avatar_url at the root level if present
    if (typeof data?.avatar_url === 'string' && data.avatar_url.startsWith('/')) {
      data.avatar_url = `${BASE_URL}${data.avatar_url}`;
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('User photos proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
