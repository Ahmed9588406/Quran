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

  // Get pagination params from query
  const url = new URL(request.url);
  const page = url.searchParams.get('page') || '1';
  const per_page = url.searchParams.get('per_page') || '10';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch feed from backend: GET /feed?page=1&per_page=10
    const backendRes = await fetch(
      `${BASE_URL}/feed?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(per_page)}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch feed' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize URLs in posts
    if (data?.posts && Array.isArray(data.posts)) {
      data.posts = data.posts.map((post: Record<string, unknown>) => {
        const normalized = { ...post };
        
        // Normalize avatar_url
        if (typeof post.avatar_url === 'string' && post.avatar_url.startsWith('/')) {
          normalized.avatar_url = `${BASE_URL}${post.avatar_url}`;
        }
        
        // Normalize media URLs
        if (Array.isArray(post.media)) {
          normalized.media = post.media.map((m: unknown) => {
            // Handle both string and object formats
            if (typeof m === 'string') {
              // If media is just a string URL, convert to object format
              const url = m.startsWith('/') ? `${BASE_URL}${m}` : m;
              const mediaType = m.toLowerCase().endsWith('.mp4') || m.toLowerCase().endsWith('.webm') ? 'video/mp4' : 'image/jpeg';
              return { url, media_type: mediaType };
            } else if (typeof m === 'object' && m !== null) {
              // If media is already an object, normalize the URL
              const normalizedMedia = { ...m as Record<string, unknown> };
              if (typeof (m as Record<string, unknown>).url === 'string' && (m as Record<string, unknown>).url.startsWith('/')) {
                normalizedMedia.url = `${BASE_URL}${(m as Record<string, unknown>).url}`;
              }
              return normalizedMedia;
            }
            return m;
          });
        }
        
        return normalized;
      });
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Feed proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
