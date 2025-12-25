/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

const BASE_URL = 'https://apisoapp.twingroups.com';

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

// Helper to normalize any URL that starts with /
function normalizeUrl(url: string | undefined | null): string | null {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/${url}`;
}

// Helper to determine media type from URL
function getMediaType(url: string): string {
  const lower = url.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.avi')) {
    return 'video';
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp')) {
    return 'image';
  }
  if (lower.includes('/video') || lower.includes('video/')) {
    return 'video';
  }
  return 'image';
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

      // Normalize URLs in posts and ensure user_id is present
      if (data?.posts && Array.isArray(data.posts)) {
        data.posts = data.posts.map((post: any) => {
          const normalized: any = {
            ...post,
            user_id: post.user_id || userId,
            avatar_url: normalizeUrl(post.avatar_url),
          };

          // Handle media - convert string URLs to object format
          if (Array.isArray(post.media)) {
            normalized.media = post.media.map((m: any) => {
              // Handle string format: "/uploads/posts/post_xxx.png"
              if (typeof m === 'string') {
                const fullUrl = normalizeUrl(m);
                return { 
                  url: fullUrl, 
                  media_url: fullUrl, 
                  media_type: getMediaType(m) 
                };
              }
              
              // Handle object format
              if (typeof m === 'object' && m !== null) {
                const rawUrl = m.url || m.media_url || m.file_url || m.path;
                const fullUrl = normalizeUrl(rawUrl);
                return {
                  ...m,
                  url: fullUrl,
                  media_url: fullUrl,
                  media_type: m.media_type || (fullUrl ? getMediaType(fullUrl) : 'image'),
                };
              }
              return m;
            });
          } else {
            normalized.media = [];
          }

          return normalized;
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
      data.user.avatar_url = normalizeUrl(data.user.avatar_url);
      data.user.cover_url = normalizeUrl(data.user.cover_url);
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('User profile proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
