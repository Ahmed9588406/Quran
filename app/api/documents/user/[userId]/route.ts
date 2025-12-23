import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://javabacked.twingroups.com/api/v1/documents/user';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');

    console.log('Fetching documents for user:', userId);

    // Send request to backend
    const response = await fetch(`${BASE_URL}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    const responseText = await response.text();
    console.log('Backend response status:', response.status);
    console.log('Backend response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: responseText },
        { status: response.status }
      );
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { documents: [] };
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
