/* eslint-disable @typescript-eslint/no-explicit-any */
const SURAH_URL = 'https://quranapi.pages.dev/api/surah.json';

// Fetch the full surah list from the remote API
export async function fetchSurahList(): Promise<any[]> {
	const res = await fetch(SURAH_URL);
	if (!res.ok) throw new Error('Failed to fetch surah list');
	return res.json();
}

// Fetch a single surah by its number (returns null if not found)
export async function fetchSurahByNumber(number: number): Promise<any | null> {
	const list = await fetchSurahList();
	const found = list.find((s: any) => {
		// common fields: 'number' or 'id' depending on API shape
		return s.number === number || s.id === number || Number(s.number) === number;
	});
	return found ?? null;
}

// Simple GET handler for next.js app router /api route
export async function GET(req: Request) {
	try {
		const url = new URL(req.url);
		const numParam = url.searchParams.get('number');
		if (numParam) {
			const n = Number(numParam);
			if (Number.isNaN(n)) {
				return new Response(JSON.stringify({ error: 'invalid number' }), {
					status: 400,
					headers: { 'content-type': 'application/json' },
				});
			}
			const surah = await fetchSurahByNumber(n);
			if (!surah) {
				return new Response(JSON.stringify({ error: 'not found' }), {
					status: 404,
					headers: { 'content-type': 'application/json' },
				});
			}
			return new Response(JSON.stringify(surah), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			});
		}

		const list = await fetchSurahList();
		return new Response(JSON.stringify(list), {
			status: 200,
			headers: { 'content-type': 'application/json' },
		});
	} catch (err: any) {
		return new Response(JSON.stringify({ error: err.message || 'unknown error' }), {
			status: 500,
			headers: { 'content-type': 'application/json' },
		});
	}
}
