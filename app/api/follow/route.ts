/**
 * Follow API Route
 * 
 * Proxies follow/unfollow requests to the external API.
 * Endpoint: POST https://apisoapp.twingroups.com/follow/{{user_id}}
 * Body: {"target_user_id":"..."}
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://apisoapp.twingroups.com';

/**
 * Get current user ID from token (decode JWT or fetch from API)
 */
async function getCurrentUserId(token: string): Promise<string | null> {
  try {
    // Try to decode JWT to get user_id
    const parts = token.replace('Bearer ', '').split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.user_id || payload.sub || payload.id) {
        return payload.user_id || payload.sub || payload.id;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    
    // Get target user ID from request body (can be userId or target_user_id)
    const targetUserId = body.target_user_id || body.userId || body.user_id;
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'target_user_id is required' },
        { status: 400 }
      );
    }

    // Get current user ID from token
    let currentUserId: string | null = null;
    if (token) {
      currentUserId = await getCurrentUserId(token);
    }
    
    // If we couldn't get user ID from token, try from body
    if (!currentUserId) {
      currentUserId = body.current_user_id || body.currentUserId;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    // Build the endpoint URL with user_id path parameter
    // Use current user ID if available, otherwise use a placeholder that the backend might handle
    const userId = currentUserId || 'me';
    const endpoint = `${BACKEND_URL}/follow/${userId}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ target_user_id: String(targetUserId) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Follow API Proxy] Error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to follow user', details: errorText },
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
        data = { success: true, is_following: true };
      }
    } else {
      data = { success: true, is_following: true };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Follow API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    
    // Get target user ID from request body (can be userId or target_user_id)
    const targetUserId = body.target_user_id || body.userId || body.user_id;
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'target_user_id is required' },
        { status: 400 }
      );
    }

    // Get current user ID from token
    let currentUserId: string | null = null;
    if (token) {
      currentUserId = await getCurrentUserId(token);
    }
    
    // If we couldn't get user ID from token, try from body
    if (!currentUserId) {
      currentUserId = body.current_user_id || body.currentUserId;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    // Build the endpoint URL with user_id path parameter
    const userId = currentUserId || 'me';
    const endpoint = `${BACKEND_URL}/follow/${userId}`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ target_user_id: String(targetUserId) }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unfollow API Proxy] Error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to unfollow user', details: errorText },
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
        data = { success: true, is_following: false };
      }
    } else {
      data = { success: true, is_following: false };
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Unfollow API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
