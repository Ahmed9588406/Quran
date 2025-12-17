/**
 * Follow API Route
 * 
 * Proxies follow/unfollow requests to the external API.
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://apisoapp.twingroups.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.headers.get('authorization');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/follow`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to follow user' },
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
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(
      `${BACKEND_URL}/follow`,
      {
        method: 'DELETE',
        headers,
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to unfollow user' },
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
