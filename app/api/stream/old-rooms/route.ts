import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

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

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching old rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch old rooms' },
      { status: 500 }
    );
  }
}
