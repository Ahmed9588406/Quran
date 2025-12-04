/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Sheikh = {
    id: string;
    name: string;
    title?: string;
    avatar?: string;
};

const MOCK_SHEIKHS: Sheikh[] = [
    { id: 's1', name: 'Sheikh Ahmad', title: 'Mufti', avatar: '/icons/sheikh1.png' },
    { id: 's2', name: 'Sheikh Omar', title: 'Scholar', avatar: '/icons/sheikh2.png' },
    { id: 's3', name: 'Sheikh Zaid', title: 'Judge', avatar: '/icons/sheikh3.png' },
];

export default function SheikhModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredSheikhs = MOCK_SHEIKHS.filter(s =>
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
                    {filteredSheikhs.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-100">
                                <Image src={s.avatar ?? '/icons/settings/profile.png'} alt={s.name} fill style={{ objectFit: 'cover' }} />
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
