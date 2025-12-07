import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://192.168.1.18:9001';
const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;

function corsHeaders() {
	// Minimal CORS for local/dev usage — adjust in production
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

export async function OPTIONS() {
	// Handle preflight
	return NextResponse.json(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		// Basic validation
		if (!body || typeof body !== 'object' || !body.email || !body.password) {
			return NextResponse.json(
				{ success: false, message: 'email and password are required' },
				{ status: 400, headers: corsHeaders() }
			);
		}

		// Forward to backend login endpoint
		const backendRes = await fetch(LOGIN_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: body.email, password: body.password }),
		});

		const data = await backendRes.json().catch(() => null);

		// Mirror backend status and body
		return NextResponse.json(data ?? { success: false }, {
			status: backendRes.status,
			headers: corsHeaders(),
		});
	} catch (err) {
		console.error('Auth proxy error:', err);
		return NextResponse.json(
			{ success: false, message: 'Internal server error' },
			{ status: 502, headers: corsHeaders() }
		);
	}
}
