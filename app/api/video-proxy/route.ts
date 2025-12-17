/**
 * Video Proxy Route
 * 
 * Proxies video requests to avoid CORS issues and ensure proper streaming.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Decode the URL if it's encoded
    const decodedUrl = decodeURIComponent(videoUrl);
    
    console.log('[Video Proxy] Fetching video:', decodedUrl);

    const rangeHeader = request.headers.get('range');
    const fetchHeaders: HeadersInit = {};
    
    if (rangeHeader) {
      fetchHeaders['Range'] = rangeHeader;
    }

    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: fetchHeaders,
    });

    if (!response.ok) {
      console.error('[Video Proxy] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        url: decodedUrl,
      });
      return NextResponse.json(
        { error: 'Failed to fetch video' },
        { status: response.status }
      );
    }

    // Create a new response with the video stream
    const headers = new Headers();
    
    // Copy important headers from the backend response
    const contentType = response.headers.get('content-type');
    if (contentType) {
      headers.set('content-type', contentType);
    } else {
      // Default to mp4 if not specified
      headers.set('content-type', 'video/mp4');
    }
    
    if (response.headers.get('content-length')) {
      headers.set('content-length', response.headers.get('content-length')!);
    }
    if (response.headers.get('content-range')) {
      headers.set('content-range', response.headers.get('content-range')!);
    }
    if (response.headers.get('accept-ranges')) {
      headers.set('accept-ranges', response.headers.get('accept-ranges')!);
    } else {
      headers.set('accept-ranges', 'bytes');
    }

    // Allow CORS
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('[Video Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    const decodedUrl = decodeURIComponent(videoUrl);

    const response = await fetch(decodedUrl, {
      method: 'HEAD',
    });

    const headers = new Headers();
    
    if (response.headers.get('content-type')) {
      headers.set('content-type', response.headers.get('content-type')!);
    }
    if (response.headers.get('content-length')) {
      headers.set('content-length', response.headers.get('content-length')!);
    }
    if (response.headers.get('accept-ranges')) {
      headers.set('accept-ranges', response.headers.get('accept-ranges')!);
    }

    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    return new NextResponse(null, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('[Video Proxy HEAD] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
    },
  });
}
