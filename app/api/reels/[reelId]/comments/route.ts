/**
 * Reels Comments API Route
 * 
 * Proxies comment requests to the external reels API.
 * Note: Backend uses /reels/{reel_id}/comment (singular) for both GET and POST
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

/**
 * Transforms backend comment response to match frontend expectations
 */
function transformCommentsResponse(backendData: any, page: number, limit: number) {
  const comments = backendData.comments || backendData.data || [];
  
  // Map backend fields to frontend ReelComment interface
  const transformedComments = comments.map((comment: any) => ({
    id: comment.id,
    reel_id: comment.reel_id,
    user_id: comment.user_id || comment.author_id,
    username: comment.username,
    user_avatar: comment.user_avatar || comment.avatar_url,
    content: comment.content,
    created_at: comment.created_at,
    likes_count: comment.likes_count || 0,
    is_liked: comment.is_liked || false,
  }));

  return {
    comments: transformedComments,
    total_count: backendData.total_count || comments.length,
    page,
    limit,
    has_more: comments.length === limit,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { reelId: string } }
) {
  try {
    const { reelId } = params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    console.log('[Comments API] Fetching comments for reel:', reelId);

    // Try the singular endpoint first (backend uses /reels/{reel_id}/comment)
    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/comment?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Comments API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // Return empty comments list instead of error for 404
      if (response.status === 404) {
        return NextResponse.json({
          comments: [],
          total_count: 0,
          page,
          limit,
          has_more: false,
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transformed = transformCommentsResponse(data, page, limit);
    return NextResponse.json(transformed);
  } catch (error) {
    console.error('[Reels Comments API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reelId: string } }
) {
  try {
    const { reelId } = params;
    const searchParams = request.nextUrl.searchParams;
    const commentId = searchParams.get('commentId');
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Delete Comment API] Backend error:', {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: response.status }
      );
    }

    const text = await response.text();
    let data = {};
    
    // Handle empty responses
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: true };
      }
    } else {
      data = { success: true };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Reels Delete Comment API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
