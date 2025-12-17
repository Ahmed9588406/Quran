/**
 * Reels Comment Like API Route
 * 
 * Proxies like/unlike comment requests to the external reels API.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

export async function POST(
  request: NextRequest,
  { params }: { params: { reelId: string; commentId: string } }
) {
  try {
    const { reelId, commentId } = params;
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/comments/${commentId}/like`,
      {
        method: 'POST',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Like Comment API] Backend error:', {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to like comment' },
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
    console.error('[Reels Like Comment API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { reelId: string; commentId: string } }
) {
  try {
    const { reelId, commentId } = params;
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/comments/${commentId}/like`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unlike Comment API] Backend error:', {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: 'Failed to unlike comment' },
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
    console.error('[Reels Unlike Comment API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
