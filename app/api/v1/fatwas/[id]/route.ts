import { NextResponse } from 'next/server';

const BACKEND_BASE = 'http://192.168.1.29:8080/api/v1';

export async function GET(request: Request, context?: { params?: { id?: string } }) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 10000);

	try {
		const id = context?.params?.id;

		if (!id) {
			clearTimeout(timeout);
			return NextResponse.json({ error: 'id required' }, { status: 400 });
		}

		const remoteUrl = `${BACKEND_BASE}/fatwas/${encodeURIComponent(id)}`;

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

		return NextResponse.json(body ?? {}, { status: res.status });
	} catch (err: any) {
		clearTimeout(timeout);
		const message = err?.name === 'AbortError' ? 'Upstream request timed out' : err?.message ?? 'Proxy error';
		return NextResponse.json({ error: 'Failed to fetch fatwa', message }, { status: 502 });
	}
}
