/* eslint-disable react-hooks/immutability */
"use client"
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import MediaPanel from './media';
type Message = { id: string; from: 'me' | 'them'; text: string; time?: string };
type Chat = { id: number; name: string; avatar?: string; time?: string; lastText?: string; unread?: number };

type Props = {
  chat?: Chat | undefined;
  messages: Message[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
  // accept both RefObject and MutableRefObject returned by useRef(...)
  scrollRef: React.RefObject<HTMLDivElement | null> | React.MutableRefObject<HTMLDivElement | null>;
};

export default function ChatContent({ chat, messages, input, setInput, onSend, scrollRef }: Props) {
  const [showContact, setShowContact] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const mediaPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef?.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, scrollRef]);

  // close panel on outside click or Escape
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!showContact && !showMedia) return;
      if (showContact && panelRef.current && e.target instanceof Node && !panelRef.current.contains(e.target)) {
        setShowContact(false);
      }
      if (showMedia && mediaPanelRef.current && e.target instanceof Node && !mediaPanelRef.current.contains(e.target)) {
        setShowMedia(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowContact(false);
        setShowMedia(false);
      }
    }
    if (showContact || showMedia) {
      document.addEventListener('mousedown', handle);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', onKey);
    };
  }, [showContact, showMedia]);

  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#F0F2F5'}}>
        <div className="flex items-center gap-4">
          {/* Avatar: show image when available, otherwise show initials as fallback */}
          <button onClick={() => setShowContact(true)} className="flex items-center gap-3 focus:outline-none">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-sm font-medium" style={{ color: '#011627' }}>
              {chat?.avatar ? (
                <Image src={chat.avatar} alt={chat?.name ?? 'avatar'} width={40} height={40} />
              ) : (
                <span>
                  {chat?.name
                    ? chat.name.split(' ').map(n => n[0] ?? '').slice(0, 2).join('').toUpperCase()
                    : 'U'}
                </span>
              )}
            </div>

            <div className="text-left">
              <button onClick={() => setShowContact(true)} className="text-sm font-medium text-left focus:outline-none">
                <div style={{ color: '#011627' }}>{chat?.name ?? 'Unknown'}</div>
                <div className="text-xs" style={{ color: '#707991' }}>last seen 5 mins ago</div>
              </button>
            </div>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8" stroke="#54656F" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="3" stroke="#54656F" strokeWidth="1.5"/>
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="4" r="1.5" fill="#54656F"/>
              <circle cx="10" cy="10" r="1.5" fill="#54656F"/>
              <circle cx="10" cy="16" r="1.5" fill="#54656F"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto flex flex-col justify-end"
        style={{ padding: '24px 16px', gap: '16px' }}
      >
        {/* Date indicator */}
        <div className="flex justify-center mb-4">
          <div className="px-3 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: '#FFFFFF', color: '#54656F', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            Today
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="flex flex-col gap-1"
                style={{
                  backgroundColor: m.from === 'me' ? '#D9FDD3' : '#FFFFFF',
                  borderRadius: '8px',
                  padding: '6px 10px 8px 10px',
                  maxWidth: '65%',
                  boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                }}
              >
                <div
                  className="text-sm"
                  style={{
                    color: '#111B21',
                    lineHeight: '1.4',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.text}
                </div>
                <div className="flex items-center justify-end gap-1">
                  <span
                    className="text-xs"
                    style={{
                      color: '#667781',
                      fontSize: '11px',
                    }}
                  >
                    {m.time}
                  </span>
                  {m.from === 'me' && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 8L6 11L13 4" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 8L9 11L16 4" stroke="#53BDEB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Input Bar - WhatsApp style */}
      <div
        className="flex items-center mt-166"
        style={{
          backgroundColor: '#F0F2F5',
          padding: '10px 16px',
          gap: '8px',
        }}
      >
        {/* Emoji button */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors" style={{ color: '#54656F' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
            <path d="M8 14C8.5 15.5 10 17 12 17C14 17 15.5 15.5 16 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
          </svg>
        </button>

        {/* Attach button */}
        <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors" style={{ color: '#54656F' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L12 12M12 12L12 22M12 12L2 12M12 12L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 2C9.79086 2 8 3.79086 8 6V12C8 14.2091 9.79086 16 12 16C14.2091 16 16 14.2091 16 12V6C16 3.79086 14.2091 2 12 2Z" fill="currentColor" transform="rotate(45 12 12)"/>
          </svg>
        </button>

        {/* Input container with rounded background */}
        <div className="flex-1 flex items-center" style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '6px 12px', paddingBottom: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSend(); } }}
            placeholder="Type a message"
            // add the selector used by page.tsx to focus the input
            className="flex-1 bg-transparent focus:outline-none chat-input"
            style={{
              color: '#111B21',
              fontSize: '15px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          />
        </div>

        {/* Mic or Send button - shows send when there's text, mic when empty */}
        {input.trim() ? (
          <button 
            onClick={onSend} 
            className="w-11 h-11 flex items-center justify-center rounded-full transition-all hover:scale-105"
            style={{ backgroundColor: '#00A884' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="white"/>
            </svg>
          </button>
        ) : (
          <button className="w-11 h-11 flex items-center justify-center hover:bg-gray-200 rounded-full transition-colors" style={{ color: '#54656F' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C10.34 2 9 3.34 9 5V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V5C15 3.34 13.66 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Contact info / Media modal (fixed) with backdrop overlay */}
      {(showContact || showMedia) && (
        <div className="fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/20" onClick={() => { setShowContact(false); setShowMedia(false); }} />
        </div>
      )}

      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-screen z-40 transition-transform duration-200 ease-in-out ${showContact ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 320, background: '#FFFFFF', boxShadow: '-2px 0 8px rgba(0,0,0,0.08)', borderLeft: '1px solid rgba(0,0,0,0.04)' }}
        aria-hidden={!showContact}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
          <div className="text-sm font-medium">Contact info</div>
          <button onClick={() => setShowContact(false)} aria-label="Close contact info" className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L18 18M6 18L18 6" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-200">
              {chat?.avatar ? (
                <Image src={chat.avatar} alt={chat?.name ?? 'avatar'} width={112} height={112} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-semibold" style={{ color: '#011627' }}>{chat?.name ? chat.name.split(' ').map(n => n[0] ?? '').slice(0,2).join('').toUpperCase() : 'U'}</div>
              )}
            </div>

            <div className="text-center">
              <div className="text-lg font-semibold" style={{ color: '#0B1220' }}>{chat?.name ?? 'Unknown'}</div>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={() => { setShowContact(false); setShowMedia(true); }} className="w-full flex items-center justify-between px-3 py-3 rounded hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4H20V20H4V4Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <div className="text-sm text-gray-700">Media, links and docs</div>
              </div>
              <div className="text-sm text-gray-500">3</div>
            </button>

            <button className="w-full mt-4 text-left text-sm text-[#8A1538] flex items-center gap-3" onClick={() => { /* TODO: delete chat action */ }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="#8A1538" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6L18.3333 19.3333C18.2911 20.1251 17.5931 20.7222 16.8005 20.7222H7.19953C6.40689 20.7222 5.70893 20.125 5.66667 19.3333L5 6M10 11V17M14 11V17M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6" stroke="#8A1538" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Delete chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Media panel modal */}
      <div
        ref={mediaPanelRef}
        className={`fixed top-0 right-0 h-screen z-40 transition-transform duration-200 ease-in-out ${showMedia ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 320, background: '#FFFFFF', boxShadow: '-2px 0 8px rgba(0,0,0,0.08)', borderLeft: '1px solid rgba(0,0,0,0.04)' }}
        aria-hidden={!showMedia}
      >
        <MediaPanel onClose={() => setShowMedia(false)} />
      </div>

    </div>
  );
}