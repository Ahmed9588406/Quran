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

// POST /api/documents/airtime - Set air time for a document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, airTime } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    if (!airTime) {
      return NextResponse.json(
        { error: 'Air time is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get authorization token from headers
    const authHeader = request.headers.get('authorization');

    // Build URL: POST /api/v1/documents/{documentId}/airtime?airTime=...
    const url = new URL(`${BASE_URL}/${documentId}/airtime`);
    url.searchParams.append('airTime', airTime);

    console.log('Setting airtime:', url.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
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
        { error: 'Failed to set air time', details: responseText },
        { status: response.status, headers: corsHeaders() }
      );
    }

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText || 'Air time set successfully' };
    }

    return NextResponse.json(data, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error('Error setting air time:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// GET /api/documents/airtime - Get scheduled documents
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Fetch user's documents to get scheduled ones
    const url = new URL(`${BASE_URL}`);
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
      },
    });

    if (!response.ok) {
      const responseText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch documents', details: responseText },
        { status: response.status, headers: corsHeaders() }
      );
    }

    const data = await response.json();
    
    // Filter documents that have airTime set
    const scheduledDocs = Array.isArray(data) 
      ? data.filter((doc: any) => doc.airTime)
      : [];

    return NextResponse.json(scheduledDocs, { status: 200, headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching scheduled documents:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
