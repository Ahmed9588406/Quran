/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * User Reels API Route
 * 
 * Proxies user reels requests to the external reels API.
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
 * Transforms backend response to match frontend expectations
 */
function transformUserReelsResponse(backendData: any, userId: string) {
  const videos = backendData.videos || [];
  
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
    user_id: userId,
    total_count: reels.length,
  };
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ userId: string }> } // <-- changed to match validator
) {
  const { userId } = await props.params; // <-- await to extract userId

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/users/${userId}/reels?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch user reels' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transformed = transformUserReelsResponse(data, userId);
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[User Reels API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
