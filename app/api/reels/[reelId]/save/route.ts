/**
 * Reels Save API Route
 * 
 * Proxies save/unsave requests to the external reels API.
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

    console.log('[Save API] Saving reel:', reelId);

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/save`,
      {
        method: 'POST',
        headers,
      }
    );

    console.log('[Save API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Save API] Backend error:', {
        status: response.status,
        body: errorText,
      });

      // Return success anyway for 404
      if (response.status === 404) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: 'Failed to save reel' },
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
    console.error('[Reels Save API Proxy] Error:', error);
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

    console.log('[Unsave API] Unsaving reel:', reelId);

    const response = await fetch(
      `${BACKEND_URL}/reels/${reelId}/save`,
      {
        method: 'DELETE',
        headers,
      }
    );

    console.log('[Unsave API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Unsave API] Backend error:', {
        status: response.status,
        body: errorText,
      });

      // Return success anyway for 404
      if (response.status === 404) {
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: 'Failed to unsave reel' },
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
    console.error('[Reels Unsave API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
