/**
 * Reels Comments API Route
 * 
 * Proxies fetch comments requests to the external reels API.
 * Endpoint: GET /reels/{reel_id} - returns reel with embedded comments
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ reelId: string }> }
) {
  try {
    const params = await props.params;
    const { reelId } = params;
    const token = request.headers.get('authorization');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    console.log('[Reels Comments API] Fetching reel with comments:', reelId);

    // Use the correct endpoint: /reels/{reel_id}
    const response = await fetch(`${BACKEND_URL}/reels/${reelId}`, {
      method: 'GET',
      headers,
    });

    console.log('[Reels Comments API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Reels Comments API] Backend error:', {
        status: response.status,
        body: errorText,
      });
      
      return NextResponse.json(
        { error: 'Failed to fetch comments', comments: [], has_more: false },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('[Reels Comments API] Response data:', JSON.stringify(data).substring(0, 500));

    // Extract comments from the reel response
    let comments: any[] = [];
    
    if (data.success && data.reel && Array.isArray(data.reel.comments)) {
      // Transform comments to match expected format
      comments = data.reel.comments.map((c: any) => ({
        id: c.id,
        reel_id: reelId,
        user_id: c.user_id || c.author_id || '',
        username: c.display_name || c.username || 'User',
        user_avatar: c.avatar_url || '',
        content: c.content,
        created_at: c.created_at,
        likes_count: c.likes_count || 0,
        is_liked: c.is_liked || false,
      }));
    }

    console.log('[Reels Comments API] Returning', comments.length, 'comments');

    return NextResponse.json({
      comments,
      has_more: false, // This endpoint returns all comments at once
      total: data.reel?.comments_count || comments.length,
    });
  } catch (error) {
    console.error('[Reels Comments API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', comments: [], has_more: false },
      { status: 500 }
    );
  }
}
