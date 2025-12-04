/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect } from 'react';
import Image from 'next/image';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AskImam({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const openSheikhModal = () => {
    try {
      // primary: dispatch the custom event (other code can listen for this)
      window.dispatchEvent(new CustomEvent('open-sheikh-modal'));
    } catch (e) {
      // ignore
    }

    try {
      // fallback: call a globally exposed function if your attached modal registers one
      const w = window as any;
      if (typeof w.openSheikhModal === 'function') {
        w.openSheikhModal();
      } else if (typeof w.__openSheikhModal === 'function') {
        w.__openSheikhModal();
      }
    } catch (e) {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative w-full max-w-2xl bg-[#fff6f3] border border-[#f0e6e5] rounded-xl shadow-lg overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden relative">
              <Image src="/icons/settings/profile.png" alt="avatar" fill style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#7b2030]">Mazen Mohamed</div>
              <div className="text-xs text-gray-500">2d</div>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* inputs */}
        <div className="px-4 pb-4">
          <div className="relative mb-3">
            <input
              placeholder="Ask a question and start it with what , why and how ?"
              className="w-full h-10 rounded-md border border-[#e6d7d5] px-3 pr-12 text-sm text-[#B3B3B3] bg-white"
            />
            <button
                type="button"
                onClick={openSheikhModal}
                aria-label="Choose sheikh"
                className="absolute top-1 right-1 p-0"
            >
                <Image
                    src="/icons/team.svg"
                    alt="Team Illustration"
                    width={30}
                    height={30}
                    className="select-none"
                />
            </button>
          </div>

          <textarea
            placeholder="Explain your question"
            className="w-full h-48 rounded-md border border-[#e6d7d5] p-3 text-sm text-[#B3B3B3] bg-white resize-none"
          />
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-transparent">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border border-[#f0e6e5] bg-white"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm text-white bg-[#7b2030] hover:bg-[#5e0e27]"
            // Replace with real submit handler as needed
            onClick={onClose}
          >
            Ask imam
          </button>
        </div>
      </div>
    </div>
  );
}
