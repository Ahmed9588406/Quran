/**
 * Send Notification API Route
 * POST - Send a notification to users
 */

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://apisoapp.twingroups.com';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

/**
 * POST /api/notifications/send - Send a notification
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') ?? '';
    const body = await req.json();

    console.log('[Notifications API] Sending notification:', body);

    // Try to send to backend
    const response = await fetch(`${BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[Notifications API] Backend error:', response.status, text);
      return new NextResponse(text, {
        status: response.status,
        headers: corsHeaders(),
      });
    }

    const data = await response.json();
    console.log('[Notifications API] Success:', data);
    
    return NextResponse.json(data, {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
