"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import StartNewMessage from "./start_new_message";
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
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (item: MessageItem) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  // manage start-new modal and inline chat state
  const [startOpen, setStartOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedContact, setSelectedContact] = useState<MessageItem | null>(null);

  const users = [
    { id: "u1", name: "Aisha Noor", avatar: "https://i.pravatar.cc/80?img=21" },
    { id: "u2", name: "Bilal Y", avatar: "https://i.pravatar.cc/80?img=17" },
    { id: "u3", name: "Sara Ali", avatar: "https://i.pravatar.cc/80?img=11" },
    { id: "u4", name: "Omar Faruk", avatar: "https://i.pravatar.cc/80?img=12" },
    { id: "u5", name: "Layla Noor", avatar: "https://i.pravatar.cc/80?img=13" },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      // if start-new modal is open and click happened inside it, do not close messages panel
      if (startOpen) {
        const startEl = document.getElementById("start-new-modal");
        if (startEl && startEl.contains(e.target as Node)) return;
      }
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
  }, [isOpen, onClose, startOpen]);

  if (!isOpen) return null;

  const items: MessageItem[] = [
    { id: "m1", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=5", snippet: "Are you still Here?", time: "Now", unread: true },
    { id: "m2", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=6", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m3", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=7", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m4", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=8", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m5", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=9", snippet: "Are you still Here?", time: "12:24pm" },
    { id: "m6", name: "Katarina", avatar: "https://i.pravatar.cc/80?img=6", snippet: "Are you still Here?", time: "12:24pm" },
  ];

  // open inline chat (inside this modal) for a selected item
  const openInlineChat = (it: MessageItem) => {
    setSelectedContact(it);
    setShowChat(true);
    setStartOpen(false);
    // do NOT call parent onOpenChat to avoid opening external floating chat
  };

  return (
    <div className="fixed right-6 bottom-20 z-50" aria-modal="true" role="dialog">
      <div
        ref={ref}
        className="w-[360px] h-[520px] max-w-[92vw] bg-[#fff6f3] border border-[#f0e6e5] rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header: show back button + contact name when chatting inline */}
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

        {/* Body: either messages list or inline chat */}
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

        {/* compose button opens start-new-message modal (hidden when inline chat is open) */}
        {!showChat && (
          <div className="absolute right-4 bottom-4">
            <button
              aria-label="Compose"
              onClick={() => { setStartOpen(true); }}
              className="inline-flex items-center"
            >
              <Image src="/icons/start_message.png" alt="Compose" width={50} height={24} style={{ objectFit: "contain" }} />
            </button>
          </div>
        )}
      </div>

      {/* StartNewMessage component */}
      <StartNewMessage
        isOpen={startOpen}
        onClose={() => setStartOpen(false)}
        users={users}
        onSelect={(u) => {
          // open inline chat for selected user (do not close Messages modal)
          openInlineChat({ id: u.id, name: u.name, avatar: u.avatar, snippet: "", time: "Now" });
        }}
      />
    </div>
  );
}
