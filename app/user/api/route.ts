/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const url = new URL(request.url);
        const size = url.searchParams.get('size') ?? '10';
        const page = url.searchParams.get('page') ?? '0';

        const remoteUrl = `http://192.168.1.29:8080/api/v1/preachers/list?size=${encodeURIComponent(
            size
        )}&page=${encodeURIComponent(page)}`;

        // Forward auth header if present
        const headers: Record<string, string> = { Accept: 'application/json' };
        const auth = request.headers.get('authorization');
        console.log('[PROXY] Forwarding auth:', auth ? 'YES' : 'NO');
        if (auth) headers.Authorization = auth;

        const res = await fetch(remoteUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeout);

        // read text then try parse once (avoid double-reading)
        const text = await res.text();
        let body: any;
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }

        console.log('[PROXY] Upstream response:', res.status, body);

        // If upstream returned non-ok, surface its status and body for debugging
        if (!res.ok) {
            // Return 502 to indicate gateway/proxy issue but include upstream info
            return NextResponse.json(
                { error: 'Upstream request failed', upstreamStatus: res.status, upstreamBody: body, authSent: !!auth },
                { status: 502 }
            );
        }

        // Success: return upstream body with 200
        return NextResponse.json(body, { status: 200 });
    } catch (err: any) {
        clearTimeout(timeout);
        const message =
            err?.name === 'AbortError' ? 'Upstream request timed out' : err?.message ?? 'Unknown proxy error';
        return NextResponse.json({ error: 'Failed to fetch preachers', message }, { status: 502 });
    }
}