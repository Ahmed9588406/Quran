import { NextResponse } from 'next/server';

const BASE_URL = 'https://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
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
        
        // Normalize avatar_url
        normalized.avatar_url = normalizeUrl(post.avatar_url as string);
        
        // Handle media - convert string URLs to object format
        if (Array.isArray(post.media)) {
          normalized.media = post.media.map((m: unknown) => {
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
              const mediaObj = m as Record<string, unknown>;
              const normalizedMedia: Record<string, unknown> = { ...mediaObj };
              
              // Try to get URL from various fields
              const rawUrl = mediaObj.url || mediaObj.media_url || mediaObj.file_url || mediaObj.path;
              if (typeof rawUrl === 'string') {
                const fullUrl = normalizeUrl(rawUrl);
                normalizedMedia.url = fullUrl;
                normalizedMedia.media_url = fullUrl;
              }
              
              // Ensure media_type is set
              if (!normalizedMedia.media_type && normalizedMedia.url) {
                normalizedMedia.media_type = getMediaType(normalizedMedia.url as string);
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
