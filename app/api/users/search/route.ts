/**
 * User Search API Route
 * 
 * GET - Search for users
 * 
 * Requirements: 2.1
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * GET /api/users/search - Search users
 */
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = searchParams.get('limit') || '50';

    const response = await fetch(
      `${BASE_URL}/search/users?q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          ...(auth ? { Authorization: auth } : {}),
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data.users || data, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
