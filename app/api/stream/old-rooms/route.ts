import { NextRequest, NextResponse } from 'next/server';

// Use the stable backend URL
const BACKEND_URL = 'https://javabacked.twingroups.com/api/v1/stream';

/**
 * GET /api/stream/old-rooms - Get old rooms with recording info
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/old-rooms`, {
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
      return NextResponse.json({ content: [], totalElements: 0 }, { status: 200 });
    }
  } catch (error) {
    console.error('Error fetching old rooms:', error);
    return NextResponse.json(
      { content: [], totalElements: 0, error: 'Failed to fetch old rooms' },
      { status: 200 }
    );
  }
}
