import { NextResponse } from 'next/server';

const BACKEND_BASE = 'http://192.168.1.29:8080/api/v1';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
	return new Response(null, {
		status: 204,
		headers: CORS_HEADERS,
	});
}

export async function GET(request: Request, context?: { params?: { status?: string } }) {
	try {
		const url = new URL(request.url);
		const status = context?.params?.status || url.searchParams.get('status') || 'pending';
		const size = url.searchParams.get('size') || '10';
		const page = url.searchParams.get('page') || '0';

		const backendUrl = `${BACKEND_BASE}/fatwas/my/${status}?size=${size}&page=${page}`;

		const auth = request.headers.get('authorization') || '';

		const backendRes = await fetch(backendUrl, {
			method: 'GET',
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
			},
		});

		const text = await backendRes.text();
		let body: any = text;
		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			body = text;
		}

		const respHeaders: Record<string, string> = {
			...CORS_HEADERS,
			'Content-Type': 'application/json',
		};

		return new Response(JSON.stringify(body), {
			status: backendRes.status,
			headers: respHeaders,
		});
	} catch (err) {
		return new Response(JSON.stringify({ message: 'Proxy error' }), {
			status: 500,
			headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
		});
	}
}
