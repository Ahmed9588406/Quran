/* eslint-disable @typescript-eslint/no-explicit-any */
const BACKEND_BASE = 'http://192.168.1.29:8080/api/v1';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
	// respond to preflight
	return new Response(null, {
		status: 204,
		headers: CORS_HEADERS,
	});
}

export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const status = url.searchParams.get('status');
		const answered = url.searchParams.get('answered');
		const size = url.searchParams.get('size') || '10';
		const page = url.searchParams.get('page') || '0';

		let backendUrl: string;

		// Handle answered fatwas endpoint
		if (answered === 'true') {
			backendUrl = `${BACKEND_BASE}/fatwas/answered?page=${page}&size=${size}&sort=createdAt,desc`;
		} else {
			// Handle pending/rejected fatwas
			const statusParam = status || 'pending';
			backendUrl = `${BACKEND_BASE}/fatwas/my/${statusParam}?size=${size}&page=${page}`;
		}

		// forward authorization if present
		const auth = req.headers.get('authorization') || '';

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

		// Build response headers: keep content-type from backend and add CORS
		const respHeaders: Record<string, string> = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
