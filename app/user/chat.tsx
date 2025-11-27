"use client";
import React, { useEffect, useRef, useState } from "react";
import { X, Smile, Paperclip, Send } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  avatar: string;
} | null;

type ChatItem = {
  id: string;
  text: string;
  time: string;
  fromMe?: boolean;
};

export default function ChatPanel({
  isOpen,
  onClose,
  contact,
  inline = false, // when true render embedded version suitable for Messages modal
}: {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  inline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    // When inline, parent (Messages modal) manages outside clicks and closing,
    // so skip attaching document listeners for inline mode.
    if (inline) return;

    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, inline]);

  if (!isOpen || !contact) return null;

  // sample messages (alternating)
  const messages: ChatItem[] = [
    { id: "c1", text: "Message here", time: "2:00pm", fromMe: true },
    { id: "c2", text: "Message here", time: "2:00pm", fromMe: false },
    { id: "c3", text: "Message here", time: "2:00pm", fromMe: true },
    { id: "c4", text: "Message here", time: "2:00pm", fromMe: false },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle send logic here
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating version: same inner content but wrapped in fixed positioned container
  const renderInner = () => (
    <>
      {/* header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e5d4e0] bg-[#f5f0f3]">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-lg">{contact.name}</div>
          <div className="text-sm text-gray-500">Active 37m Ago</div>
        </div>
        <button
          onClick={onClose}
          className="text-[#7b2030] hover:text-[#5a1820] transition-colors"
          aria-label="Close chat"
        >
          {/* restored lucide icon */}
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfcfc]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-full px-5 py-3 ${
                m.fromMe
                  ? "bg-[#7b2030] text-white"
                  : "bg-[#c9a870] text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[15px]">{m.text}</span>
                <span className="text-xs opacity-90 whitespace-nowrap">
                  {m.time}
                  {m.fromMe && (
                    <span className="ml-1">
                      <svg className="inline w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                      </svg>
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* input bar */}
      <div className="p-4 border-t border-[#e5d4e0] bg-white">
        <div className="flex items-center gap-3">
          {/* emoji button */}
          <button
            className="p-2 text-[#7b2030] hover:text-[#5a1820] transition-colors"
            aria-label="Add emoji"
          >
            {/* restored lucide icon */}
            <Smile className="w-6 h-6" />
          </button>

          {/* text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="w-full px-4 py-2 text-gray-500 bg-white border-none focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* attachment button */}
          <button
            className="p-2 text-[#7b2030] hover:text-[#5a1820] transition-colors"
            aria-label="Attach file"
          >
            {/* restored lucide icon */}
            <Paperclip className="w-6 h-6" />
          </button>

          {/* camera button */}
          <button
            className="p-2 text-[#7b2030] hover:text-[#5a1820] transition-colors"
            aria-label="Take photo"
          >
            {/* keep existing camera SVG (unchanged) */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* mic / send button */}
          <button
            onClick={handleSend}
            className="p-3 bg-[#7b2030] text-white rounded-full hover:bg-[#5a1820] transition-colors"
            aria-label="Voice message / Send"
          >
            {/* restored lucide Send icon */}
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );

  // render floating or inline wrapper
  if (inline) {
    // embedded version - no fixed positioning or outside click handling
    return (
      <div ref={ref} className="flex flex-col w-full h-full">
        {renderInner()}
      </div>
    );
  }

  // floating version: position to the right side (keeps existing behavior)
  const rightOffsetPx = 6 + 360 + 12; // 378
  return (
    <div
      ref={ref}
      className="fixed bottom-20 w-[360px] h-[520px] bg-white shadow-2xl flex flex-col z-50 border border-gray-200 rounded-2xl overflow-hidden"
      style={{ right: `${rightOffsetPx}px` }}
    >
      {renderInner()}
    </div>
  );
}