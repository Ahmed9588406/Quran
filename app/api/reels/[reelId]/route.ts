/**
 * Get Reel by ID API Route
 * 
 * Proxies get reel by ID requests to the external reels API.
 * Endpoint: GET /reels/{reel_id}
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

const BACKEND_BASE = 'http://apisoapp.twingroups.com';

/**
 * Normalizes URLs to be absolute
 */
function normalizeUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE}${url}`;
}

/**
 * Transforms backend reel response to match frontend expectations
 */
function transformReelResponse(backendData: any) {
  const video = backendData;
  
  return {
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
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { reelId: string } }
) {
  try {
    const { reelId } = params;
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    console.log('[Get Reel API] Fetching reel:', reelId);

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Get Reel API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch reel' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transformed = transformReelResponse(data);
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[Get Reel API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
