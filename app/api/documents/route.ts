import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://javabacked.twingroups.com/api/v1/documents';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

// GET /api/documents - Fetch user's documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const authHeader = request.headers.get('authorization');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Fetch documents from backend
    const url = new URL(`${BASE_URL}`);
    url.searchParams.append('userId', userId);

    console.log('Fetching documents from:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Failed to fetch documents:', responseText);
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: responseText },
        { status: response.status, headers: corsHeaders() }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;
    const liveStreamId = formData.get('liveStreamId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');

    // Build URL with query parameters (userId is required in query)
    const url = new URL(`${BASE_URL}/upload`);
    url.searchParams.append('userId', userId);
    if (liveStreamId) {
      url.searchParams.append('liveStreamId', liveStreamId);
    }

    // Create FormData for backend - only include the file
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    console.log('Uploading to:', url.toString());
    console.log('File:', file.name, file.type, file.size);

    // Send request to backend
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        ...(authHeader && { Authorization: authHeader }),
      },
      body: backendFormData,
    });

    const responseText = await response.text();
    console.log('Backend response status:', response.status);
    console.log('Backend response:', responseText);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to upload document', details: responseText },
        { status: response.status }
      );
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
