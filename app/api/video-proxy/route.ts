/**
 * Video Proxy API Route
 * 
 * Handles video streaming with proper CORS headers and error handling
 * Allows the frontend to stream videos from external sources
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Missing video URL' },
        { status: 400 }
      );
    }

    // Validate URL is from allowed domain
    const url = new URL(videoUrl);
    if (!url.hostname.includes('apisoapp.twingroups.com')) {
      return NextResponse.json(
        { error: 'Video URL not from allowed domain' },
        { status: 403 }
      );
    }

    // Fetch the video from the external source
    const response = await fetch(videoUrl, {
      headers: {
        'Range': request.headers.get('range') || '',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Create a new response with the video stream
    const headers = new Headers();
    
    // Copy relevant headers from the original response
    if (response.headers.get('content-type')) {
      headers.set('content-type', response.headers.get('content-type')!);
    }
    if (response.headers.get('content-length')) {
      headers.set('content-length', response.headers.get('content-length')!);
    }
    if (response.headers.get('accept-ranges')) {
      headers.set('accept-ranges', response.headers.get('accept-ranges')!);
    }
    if (response.headers.get('content-range')) {
      headers.set('content-range', response.headers.get('content-range')!);
    }

    // Add CORS headers
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Range');
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');

    // Cache video for 1 hour
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('[video-proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy video' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
    },
  });
}
