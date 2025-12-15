/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';

type Sheikh = {
    id: string;
    name: string;
    title?: string;
    avatar?: string;
};

export default function SheikhModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sheikhs, setSheikhs] = useState<Sheikh[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const onOpen = () => setIsOpen(true);
        // listen for custom event
        window.addEventListener('open-sheikh-modal', onOpen as EventListener);
        // expose fallback global function
        (window as any).openSheikhModal = () => setIsOpen(true);

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('open-sheikh-modal', onOpen as EventListener);
            delete (window as any).openSheikhModal;
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    // fetch when modal opens
    useEffect(() => {
        const controller = new AbortController();
        const url = '/user/api?size=10&page=0';

        async function load() {
            setLoading(true);
            setError(null);
            try {
                // Get auth token from logged-in user (now returns access_token correctly)
                const token = getAuthToken();
                const headers: Record<string, string> = {};
                
                if (token) {
                    headers.Authorization = `Bearer ${token}`;
                    console.log('[MODAL] Sending auth token');
                } else {
                    console.warn('[MODAL] No auth token found — attempting without auth');
                }

                const res = await fetch(url, { signal: controller.signal, headers });
                // read text once and parse
                const text = await res.text();
                let parsed: any;
                try {
                    parsed = JSON.parse(text);
                } catch {
                    parsed = text;
                }

                if (!res.ok) {
                    // upstream/proxy returned non-ok — show details
                    const detail =
                        typeof parsed === 'string' ? parsed : JSON.stringify(parsed, Object.keys(parsed).slice(0, 10));
                    throw new Error(`Proxy error (${res.status}): ${detail}`);
                }

                const data: {
                    content: Array<{
                        id: string;
                        username: string;
                        displayName?: string;
                        avatarUrl?: string;
                        bio?: string;
                        isVerified?: boolean;
                    }>;
                    // ...other pagination fields ignored
                } = parsed;

                const mapped: Sheikh[] = (data.content || []).map(p => ({
                    id: p.id,
                    name: p.displayName ?? p.username,
                    title: p.bio ? (p.bio.length > 80 ? p.bio.slice(0, 80) + '...' : p.bio) : undefined,
                    avatar: p.avatarUrl,
                }));

                setSheikhs(mapped);
            } catch (err: any) {
                if (err.name !== 'AbortError') {
                    // surface meaningful message
                    setError(err.message ?? 'Failed to load preachers');
                }
            } finally {
                setLoading(false);
            }
        }

        if (isOpen) {
            load();
        } else {
            // clear previous results when closed (optional)
            setSheikhs([]);
            setError(null);
            setLoading(false);
        }

        return () => controller.abort();
    }, [isOpen]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredSheikhs = sheikhs.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const selectSheikh = (s: Sheikh) => {
        // dispatch selection event for consumers
        window.dispatchEvent(new CustomEvent('sheikh-selected', { detail: s }));
        setIsOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />

            <div className="relative w-full max-w-md bg-[#FFF9F3] border border-[#f0e6e5] rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-4">
                    <h3 className="text-sm font-semibold text-gray-800">Choose a Sheikh</h3>
                    <button aria-label="Close" onClick={() => setIsOpen(false)} className="text-gray-500 p-2 rounded-full">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <div className="px-4 pb-2">
                    <input
                        type="text"
                        placeholder="Search sheikhs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7b2030]"
                    />
                </div>

                <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-auto">
                    {loading && <div className="text-center text-sm text-gray-500">Loading...</div>}
                    {error && <div className="text-center text-sm text-red-500">Error: {error}</div>}
                    {!loading && !error && filteredSheikhs.length === 0 && (
                        <div className="text-center text-sm text-gray-500">No sheikhs found.</div>
                    )}

                    {filteredSheikhs.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-100">
                                {/* use img to avoid Next/Image external domain config */}
                                <img src={s.avatar ?? '/icons/settings/profile.png'} alt={s.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">{s.name}</div>
                                {s.title && <div className="text-xs text-gray-500">{s.title}</div>}
                            </div>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => selectSheikh(s)}
                                    className="px-3 py-1.5 bg-[#7b2030] text-white text-xs rounded-md"
                                >
                                    Select
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-3 p-4 bg-transparent">
                    <button onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm border border-[#f0e6e5] bg-white">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
