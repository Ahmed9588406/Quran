import { NextResponse } from 'next/server';

/**
 * POST /user/api/fatwas
 * Proxy request to remote: http://192.168.1.29:8080/api/v1/fatwas
 */
export async function POST(request: Request) {
	// 10s timeout
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);

	try {
		const payload = await request.json().catch(() => null);
		// basic validation
		if (!payload || typeof payload.question !== 'string' || payload.question.trim() === '') {
			clearTimeout(timeout);
			return NextResponse.json({ error: 'question is required' }, { status: 400 });
		}

		const remoteUrl = 'http://192.168.1.29:8080/api/v1/fatwas';

		// forward authorization header if present
		const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
		const auth = request.headers.get('authorization');
		if (auth) headers.Authorization = auth;

		const res = await fetch(remoteUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify(payload),
			signal: controller.signal,
		});

		clearTimeout(timeout);

		const text = await res.text().catch(() => '');
		let body: any = text;
		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			// keep raw text
			body = text;
		}

		// Mirror upstream status and body
		return NextResponse.json(body ?? {}, { status: res.status });
	} catch (err: any) {
		clearTimeout(timeout);
		const msg = err?.name === 'AbortError' ? 'Upstream request timed out' : err?.message ?? 'Proxy error';
		return NextResponse.json({ error: 'Failed to post fatwa', message: msg }, { status: 502 });
	}
}
