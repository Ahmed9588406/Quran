import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(
	request: NextRequest,
	props: { params: Promise<{ status: string }> }
) {
	const { status } = await props.params;

	try {
		const token = request.headers.get('authorization');
		const headers: HeadersInit = { 'Content-Type': 'application/json' };
		if (token) headers['Authorization'] = token;

		const res = await fetch(`${BACKEND_BASE}/fatwas/my/${encodeURIComponent(status)}`, {
			method: 'GET',
			headers,
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			return NextResponse.json({ error: 'Failed to fetch fatwas', details: text }, { status: res.status });
		}

		const data = await res.json();
		return NextResponse.json(data);
	} catch (err) {
		console.error('[V1 Fatwas My API] Error:', err);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
