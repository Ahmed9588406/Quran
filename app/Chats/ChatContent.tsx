/* eslint-disable react-hooks/immutability */
"use client"
import React from 'react';
import Image from 'next/image';
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
  React.useEffect(() => {
    const el = scrollRef?.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, scrollRef]);

  return (
    <div className="flex-1 flex flex-col bg-white ">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: '#E5E7EB', backgroundColor: '#F0F2F5'}}>
        <div className="flex items-center gap-4">
          {/* Avatar: show image when available, otherwise show initials as fallback */}
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
          <div>
            <div className="text-sm font-medium" style={{ color: '#011627' }}>{chat?.name ?? 'Unknown'}</div>
            <div className="text-xs" style={{ color: '#707991' }}>last seen 5 mins ago</div>
          </div>
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
    </div>
  );
}