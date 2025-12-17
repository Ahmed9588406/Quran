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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') || '20';
  const page = url.searchParams.get('page') || '1';

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const backendRes = await fetch(
      `${BASE_URL}/users/${userId}/posts?limit=${limit}&page=${page}`,
      {
        method: 'GET',
        headers,
      }
    );

    const data = await backendRes.json().catch(() => null);

    if (!backendRes.ok) {
      return NextResponse.json(data ?? { error: 'Failed to fetch user posts' }, {
        status: backendRes.status,
        headers: corsHeaders(),
      });
    }

    // Normalize URLs in posts
    if (data?.posts && Array.isArray(data.posts)) {
      data.posts = data.posts.map((post: Record<string, unknown>) => {
        const normalized = { ...post };
        
        if (typeof post.avatar_url === 'string' && post.avatar_url.startsWith('/')) {
          normalized.avatar_url = `${BASE_URL}${post.avatar_url}`;
        }
        
        // Handle media - convert string URLs to object format
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
    console.error('User posts proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
