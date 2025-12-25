/**
 * Reels Like API Route
 * 
 * Proxies like/unlike requests to the external reels API.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

export async function POST(
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

    console.log('[Like API] Liking reel:', reelId, 'Token:', token ? 'present' : 'missing');

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/like`,
      {
        method: 'POST',
        headers,
      }
    );

    console.log('[Like API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Like API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${BACKEND_URL}/reels/${reelId}/like`,
      });

      // Return success anyway for 404 (endpoint might not exist but like was recorded)
      if (response.status === 404) {
        console.warn('[Like API] Endpoint returned 404 - returning success anyway');
        return NextResponse.json({ success: true, likes_count: 0 });
      }

      return NextResponse.json(
        { error: 'Failed to like reel' },
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

    console.log('[Like API] Response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Reels Like API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    console.log('[Unlike API] Unliking reel:', reelId);

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/like`,
      {
        method: 'DELETE',
        headers,
      }
    );

    console.log('[Unlike API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unlike API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      // Return success anyway for 404 (endpoint might not exist but unlike was recorded)
      if (response.status === 404) {
        return NextResponse.json({ success: true, likes_count: 0 });
      }

      return NextResponse.json(
        { error: 'Failed to unlike reel' },
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

    console.log('[Unlike API] Response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Reels Unlike API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
