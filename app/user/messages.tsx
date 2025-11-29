"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ChatPanel from "./chat"; // inline-capable chat component

type MessageItem = {
  id: string;
  name: string;
  avatar: string;
  snippet: string;
  time: string;
  unread?: boolean;
};

export default function MessagesModal({
  isOpen,
  onClose,
  onOpenChat, // kept for compatibility but not required
  onOpenStart, // NEW: request parent to open StartNewMessage
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (item: MessageItem) => void;
  onOpenStart?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // manage inline chat state
  const [showChat, setShowChat] = useState(false);
  const [selectedContact, setSelectedContact] = useState<MessageItem | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: MessageItem[] = [
    { id: "m1", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=5", snippet: "Are you still Here?", time: "Now", unread: true },
    { id: "m2", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=6", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m3", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=7", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m4", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=8", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m5", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=9", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m6", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=6", snippet: "Are you still Here?", time: "12:24pm" },
  ];

  const openInlineChat = (it: MessageItem) => {
    setSelectedContact(it);
    setShowChat(true);
  };

  return (
    <div className="fixed right-6 bottom-20 z-50" aria-modal="true" role="dialog">
      <div
        ref={ref}
        className="w-[360px] h-[520px] max-w-[92vw] bg-[#fff6f3] border border-[#f0e6e5] rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          {!showChat ? (
            <>
              <div className="text-sm font-bold text-[#7b2030]">Messages</div>
              <button
                aria-label="Collapse"
                onClick={() => onClose()}
                className="text-[#7b2030] text-sm font-bold"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setShowChat(false); setSelectedContact(null); }}
                  className="text-[#7b2030] p-1 rounded-md"
                  aria-label="Back to messages"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="text-sm font-bold text-[#7b2030]">{selectedContact?.name}</div>
              </div>

              <div>
                <button
                  aria-label="Close chat"
                  onClick={() => { setShowChat(false); setSelectedContact(null); }}
                  className="text-[#7b2030] text-sm font-bold"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-[#7b2030]" />

        {/* Body */}
        <div className="flex-1 relative">
          {!showChat ? (
            <div className="px-3 py-3 overflow-auto space-y-3">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-start gap-3 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => openInlineChat(it)}
                  onKeyDown={(e) => { if (e.key === "Enter") openInlineChat(it); }}
                >
                  <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
                    <Image src={it.avatar} alt={it.name} width={48} height={48} style={{ objectFit: "cover" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold truncate text-[#000000]">{it.name}</div>
                        </div>
                        <div className="text-sm text-gray-700 truncate">{it.snippet}</div>
                      </div>

                      <div className="flex-shrink-0 ml-3 text-right">
                        <div className={`text-xs ${it.unread ? "text-[#7b2030] font-semibold" : "text-[#7b2030]"}`}>{it.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Inline ChatPanel: render chat UI inside Messages modal by using inline prop
            <div className="w-full h-full">
              <ChatPanel
                isOpen={true}
                onClose={() => { setShowChat(false); setSelectedContact(null); }}
                contact={selectedContact}
                inline={true}
              />
            </div>
          )}
        </div>

        {/* compose button: request parent to open StartNewMessage and close Messages */}
        {!showChat && (
          <div className="absolute right-4 bottom-4">
            <button
              aria-label="Compose"
              onClick={() => {
                onClose();
                onOpenStart?.();
              }}
              className="inline-flex items-center"
            >
              <Image src="/icons/start_message.png" alt="Compose" width={50} height={24} style={{ objectFit: "contain" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
