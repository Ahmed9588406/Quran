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

    // Keep logging light; media debugging can be enabled when needed.
    // console.log('[feed] status', backendRes.status);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch feed' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize URLs in posts (and normalize media shape)
    if (data?.posts && Array.isArray(data.posts)) {
      data.posts = data.posts.map((post: Record<string, unknown>) => {
        const normalized = { ...post };
        
        // Normalize avatar_url
        if (typeof post.avatar_url === 'string' && post.avatar_url.startsWith('/')) {
          normalized.avatar_url = `${BASE_URL}${post.avatar_url}`;
        }
        
        // Some backend responses may not use `media`; normalize common variants into `media`.
        const anyPost = post as any;
        const rawMedia =
          (Array.isArray(anyPost.media) ? anyPost.media : null) ??
          (Array.isArray(anyPost.media_files) ? anyPost.media_files : null) ??
          (Array.isArray(anyPost.attachments) ? anyPost.attachments : null) ??
          (Array.isArray(anyPost.files) ? anyPost.files : null) ??
          (Array.isArray(anyPost.images) ? anyPost.images : null) ??
          (Array.isArray(anyPost.videos) ? anyPost.videos : null) ??
          null;

        if (rawMedia) {
          normalized.media = rawMedia.map((m: unknown) => {
            // String URL
            if (typeof m === 'string') {
              const url = m.startsWith('/') ? `${BASE_URL}${m}` : m;
              const lower = m.toLowerCase();
              const mediaType = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov')
                ? 'video/mp4'
                : 'image/jpeg';
              return { url, media_url: url, media_type: mediaType };
            }

            // Object variant
            if (typeof m === 'object' && m !== null) {
              const mediaObj = m as Record<string, unknown>;

              // Try multiple possible keys for the URL
              const candidate =
                (typeof mediaObj.media_url === 'string' && mediaObj.media_url) ||
                (typeof mediaObj.url === 'string' && mediaObj.url) ||
                (typeof (mediaObj as any).file_url === 'string' && (mediaObj as any).file_url) ||
                (typeof (mediaObj as any).path === 'string' && (mediaObj as any).path) ||
                (typeof (mediaObj as any).src === 'string' && (mediaObj as any).src) ||
                '';

              const normalizedUrl = candidate
                ? candidate.startsWith('/')
                  ? `${BASE_URL}${candidate}`
                  : candidate
                : '';

              const typeCandidate =
                (typeof mediaObj.media_type === 'string' && mediaObj.media_type) ||
                (typeof (mediaObj as any).type === 'string' && (mediaObj as any).type) ||
                (typeof (mediaObj as any).mime === 'string' && (mediaObj as any).mime) ||
                '';

              return {
                ...mediaObj,
                url: normalizedUrl || undefined,
                media_url: normalizedUrl || undefined,
                media_type: typeCandidate || (normalizedUrl.toLowerCase().includes('.mp4') ? 'video/mp4' : 'image/jpeg'),
              };
            }

            return m;
          });
        } else {
          // Ensure `media` exists for the UI (avoid undefined surprises)
          normalized.media = Array.isArray((post as any).media) ? (post as any).media : [];
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
