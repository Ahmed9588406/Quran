/**
 * Reels API Route
 * 
 * Proxies requests to the external reels API to avoid CORS issues.
 * All reels API calls should go through this route instead of calling the backend directly.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://apisoapp.twingroups.com';

const BACKEND_BASE = 'https://apisoapp.twingroups.com';

/**
 * Normalizes URLs to be absolute
 */
function normalizeUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE}${url}`;
}

/**
 * Transforms backend response to match frontend expectations
 */
function transformReelsResponse(backendData: any, page: number, limit: number) {
  const videos = backendData.videos || [];
  const totalReturned = videos.length;
  
  // Map backend fields to frontend Reel interface
  const reels = videos.map((video: any) => ({
    id: video.id,
    user_id: video.author_id,
    username: video.username,
    user_avatar: normalizeUrl(video.avatar_url),
    video_url: normalizeUrl(video.video_url),
    thumbnail_url: normalizeUrl(video.thumbnail_url),
    content: video.content,
    visibility: 'public' as const,
    likes_count: video.likes_count || 0,
    comments_count: video.comments_count || 0,
    is_liked: video.liked_by_current_user || false,
    is_saved: false,
    is_following: video.is_following || false,
    created_at: video.created_at,
  }));

  return {
    reels,
    page,
    limit,
    has_more: totalReturned === limit, // If we got a full page, there might be more
  };
}

/**
 * GET /api/reels
 * Proxies GET requests to the reels endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/reels?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Reels API Proxy] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch reels from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transformed = transformReelsResponse(data, page, limit);
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[Reels API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
