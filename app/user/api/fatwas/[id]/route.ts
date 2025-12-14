/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

export async function GET(request: Request, context?: { params?: { id?: string } }) {
	// 10s timeout
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);

	try {
		// Try to obtain id from context.params (normal case) or fallback to parsing the request URL
		let id: string | undefined = context?.params?.id;
		if (!id) {
			try {
				const url = new URL(request.url);
				// extract last non-empty segment
				const segments = url.pathname.split('/').filter(Boolean);
				// find 'fatwas' segment and take next segment if available
				const idx = segments.findIndex((s) => s === 'fatwas');
				if (idx >= 0 && idx + 1 < segments.length) {
					id = segments[idx + 1];
				} else {
					// as fallback, take the last segment
					id = segments[segments.length - 1];
				}
			} catch {
				// ignore
			}
		}

		if (!id) {
			clearTimeout(timeout);
			return NextResponse.json({ error: 'id required' }, { status: 400 });
		}

		const remoteUrl = `http://192.168.1.29:8080/api/v1/fatwas/${encodeURIComponent(id)}`;

		// forward Authorization header if provided by client
		const headers: Record<string, string> = { Accept: 'application/json' };
		const auth = request.headers.get('authorization');
		if (auth) headers.Authorization = auth;

		const res = await fetch(remoteUrl, {
			method: 'GET',
			headers,
			signal: controller.signal,
		});

		clearTimeout(timeout);

		const text = await res.text().catch(() => '');
		let body: any = text;
		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			body = text;
		}

		// Mirror upstream status and body
		return NextResponse.json(body ?? {}, { status: res.status });
	} catch (err: any) {
		clearTimeout(timeout);
		const message = err?.name === 'AbortError' ? 'Upstream request timed out' : err?.message ?? 'Proxy error';
		return NextResponse.json({ error: 'Failed to fetch fatwa', message }, { status: 502 });
	}
}
