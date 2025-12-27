import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const monthYear = searchParams.get('monthYear');

    if (!userId || !monthYear) {
      return NextResponse.json({ error: 'Missing userId or monthYear' }, { status: 400 });
    }

    const externalUrl = `https://javabacked.twingroups.com/api/v1/documents/calendar?userId=${encodeURIComponent(
      userId
    )}&monthYear=${encodeURIComponent(monthYear)}`;

    // Forward Authorization header from client request to upstream API
    const authHeader = req.headers.get('authorization');
    
    // Allow passing an API key from server environment to authenticate upstream requests.
    // Set CALENDAR_API_KEY and optionally CALENDAR_API_KEY_HEADER in your .env.local
    // e.g.
    // CALENDAR_API_KEY=Bearer abcdef12345
    // CALENDAR_API_KEY_HEADER=Authorization
    const apiKey = process.env.CALENDAR_API_KEY;
    const apiKeyHeader = process.env.CALENDAR_API_KEY_HEADER || 'Authorization';

    const fetchOptions: RequestInit = { headers: {} };
    
    // Prefer forwarding client Authorization header, fallback to env API key
    if (authHeader) {
      // @ts-ignore
      fetchOptions.headers!['Authorization'] = authHeader;
    } else if (apiKey) {
      // @ts-ignore
      fetchOptions.headers![apiKeyHeader] = apiKey;
    }

    const res = await fetch(externalUrl, fetchOptions);

    const contentType = res.headers.get('content-type') || '';

    // Try to parse JSON body when possible
    let bodyText: string | null = null;
    try {
      if (contentType.includes('application/json')) {
        const json = await res.json();
        return NextResponse.json(json, { status: res.status });
      } else {
        bodyText = await res.text();
      }
    } catch (e) {
      // fallback to text
      try {
        bodyText = await res.text();
      } catch (e2) {
        bodyText = null;
      }
    }

    const headers: Record<string, string> = {};
    if (contentType) headers['Content-Type'] = contentType;

    return new NextResponse(bodyText ?? '', { status: res.status, headers });
  } catch (err) {
    console.error('Calendar proxy error:', err);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 502 });
  }
}
