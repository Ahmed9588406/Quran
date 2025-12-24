import { NextRequest, NextResponse } from 'next/server';

// Use the stable backend URL
const BACKEND_URL = 'https://javabacked.twingroups.com/api/v1/stream';

/**
 * GET /api/stream/rooms - Get all rooms (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';

    const response = await fetch(`${BACKEND_URL}/rooms?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error('Non-JSON response from backend:', text.substring(0, 200));
      // Return empty content array on parse error
      return NextResponse.json({ content: [], totalElements: 0 }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { content: [], totalElements: 0, error: 'Failed to fetch rooms' },
      { status: 200 }
    );
  }
}

/**
 * POST /api/stream/rooms - Create a new room (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      console.error('Non-JSON response from backend:', text.substring(0, 200));
      if (response.ok) {
        return NextResponse.json({ success: true, message: 'Room created' }, { status: 200 });
      }
      return NextResponse.json({ error: 'Invalid response from server' }, { status: response.status });
    }
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
