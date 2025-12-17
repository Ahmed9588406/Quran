import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'http://apisoapp.twingroups.com';
const LOGIN_ENDPOINT = `${BASE_URL}/auth/login`;

function corsHeaders() {
	// Minimal CORS for local/dev usage — adjust in production
	return {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, Authorization',
	};
}

function serializeCookie(name: string, value: string, opts: { maxAge?: number; httpOnly?: boolean; secure?: boolean; path?: string; sameSite?: string }) {
	const parts = [`${name}=${encodeURIComponent(value)}`];
	if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
	parts.push(`Path=${opts.path ?? '/'}`);
	if (opts.httpOnly) parts.push('HttpOnly');
	if (opts.secure) parts.push('Secure');
	if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
	return parts.join('; ');
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

		const backendRes = await fetch(LOGIN_ENDPOINT, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: body.email, password: body.password }),
		});

		const data = await backendRes.json().catch(() => null);

		// If login failed, mirror backend response
		if (!backendRes.ok) {
			return NextResponse.json(data ?? { success: false }, {
				status: backendRes.status,
				headers: corsHeaders(),
			});
		}

		// Detect common token field names
		const accessToken = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.data?.accessToken ?? data?.data?.access_token;
		const refreshToken = data?.refreshToken ?? data?.refresh_token ?? data?.data?.refreshToken ?? data?.data?.refresh_token;
		const expiresIn = Number(data?.expiresIn ?? data?.expires_in ?? 0) || undefined;

		// Build Set-Cookie headers
		const secure = process.env.NODE_ENV === 'production';
		const cookies: string[] = [];

		if (accessToken) {
			cookies.push(
				serializeCookie('accessToken', accessToken, {
					maxAge: expiresIn ?? 60 * 60 * 24 * 7, // default 7 days
					httpOnly: true,
					secure,
					path: '/',
					sameSite: 'Lax',
				})
			);
		}

		if (refreshToken) {
			// longer default for refresh token
			cookies.push(
				serializeCookie('refreshToken', refreshToken, {
					maxAge: 60 * 60 * 24 * 30, // 30 days
					httpOnly: true,
					secure,
					path: '/',
					sameSite: 'Lax',
				})
			);
		}

		// If backend returned a user object with a relative avatar path, convert to absolute URL
		if (data && data.data && data.data.user && typeof data.data.user.avatar_url === 'string') {
			const avatar = data.data.user.avatar_url;
			if (avatar && avatar.startsWith('/')) {
				data.data.user.avatar_url = `${BASE_URL}${avatar}`;
			}
		}

		// Keep tokens in response body so client can store them in localStorage for auth checks
		// Also include normalized tokens at root level for consistent client-side access
		const responseBody = JSON.parse(JSON.stringify(data));
		
		// Ensure tokens are available at a consistent location for the client
		if (accessToken) {
			responseBody.access_token = accessToken;
		}
		if (refreshToken) {
			responseBody.refresh_token = refreshToken;
		}

		// Return response with Set-Cookie headers
		const baseHeaders = corsHeaders();
		const response = NextResponse.json(responseBody ?? { success: true }, {
			status: backendRes.status,
			headers: baseHeaders,
		});
		// append multiple Set-Cookie headers correctly
		for (const cookie of cookies) {
			response.headers.append('Set-Cookie', cookie);
		}
		return response;
	} catch (err) {
		console.error('Auth proxy error:', err);
		return NextResponse.json(
			{ success: false, message: 'Internal server error' },
			{ status: 502, headers: corsHeaders() }
		);
	}
}
