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
  // If already has http/https, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // If starts with /, prepend base URL
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  // Otherwise, assume it's a relative path
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
  // Check for video in path
  if (lower.includes('/video') || lower.includes('video/')) {
    return 'video';
  }
  return 'image'; // default to image
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

    // Log the raw backend response for debugging
    console.log("=== FEED BACKEND RESPONSE ===");
    console.log("Backend Status:", backendRes.status);
    if (data?.posts && Array.isArray(data.posts)) {
      console.log("Number of posts:", data.posts.length);
      data.posts.forEach((post: any, idx: number) => {
        console.log(`Post ${idx + 1} (ID: ${post.id}):`, {
          content: post.content?.substring(0, 50),
          media: post.media,
          media_count: post.media?.length || 0
        });
      });
    }
    console.log("=============================");

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
        normalized.avatar_url = normalizeUrl(post.avatar_url as string);
        
        // Normalize media URLs - handle various formats
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
        
        // Log normalized post for debugging
        console.log(`Normalized post ${post.id}:`, {
          media: normalized.media,
          avatar_url: normalized.avatar_url
        });
        
        return normalized;
      });
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (err) {
    console.error('Feed proxy error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 502, headers: corsHeaders() });
  }
}
