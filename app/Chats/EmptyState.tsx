"use client"
import React from 'react';

type Props = {
  title?: string;
  description?: string;
  note?: string;
};

export default function EmptyState({
  title = 'WhatsApp for Windows',
  description = 'Send and receive messages without keeping your phone online. Use WhatsApp on up to 4 linked devices and 1 phone at the same time.',
  note = 'Your personal messages are end-to-end encrypted',
}: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-white">
      <div className="text-center text-gray-400">
        <div className="mb-6">
          <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto bg-gray-100">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 11.5C21 16.1944 16.9706 20 11.75 20C10.0064 20 8.35062 19.5511 6.97291 18.7448L3 19.5L3.79624 15.6533C2.85502 14.161 2.35352 12.3866 2.35352 10.5C2.35352 5.8056 6.38389 2 11.75 2C17.1161 2 21 5.8056 21 11.5Z" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="mt-8 text-xs text-gray-400 flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C7.58 1 4 4.58 4 9v3.5C4 16.43 7.58 20 12 20s8-3.57 8-7.5V9c0-4.42-3.58-8-8-8z" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11V13" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{note}</span>
      </div>
    </div>
  );
}
