"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Smile, Paperclip, Send } from "lucide-react";
import { chatAPI } from "@/lib/chat/api";
import { Message } from "@/lib/chat/types";

type Contact = {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
} | null;

const BASE_URL = "http://192.168.1.18:9001";

function normalizeUrl(url?: string | null): string {
  if (!url) return "/icons/settings/profile.png";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPanel({
  isOpen,
  onClose,
  contact,
  chatId,
  inline = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  chatId?: string;
  inline?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [activeChatId, setActiveChatId] = useState<string | null>(chatId || null);


  // Get current user ID
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || "");
      }
    } catch {
      // ignore
    }
  }, []);

  const [error, setError] = useState<string | null>(null);

  // Create or get chat when contact changes
  useEffect(() => {
    if (!isOpen || !contact) return;
    
    const initChat = async () => {
      setError(null);
      
      if (chatId) {
        setActiveChatId(chatId);
        return;
      }
      
      // Create chat with contact if no chatId provided
      try {
        const response = await chatAPI.createChat(contact.id);
        setActiveChatId(response.chat_id);
      } catch (err: unknown) {
        console.error("Error creating chat:", err);
        // Check if it's a foreign key constraint error (user doesn't exist)
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("foreign key") || errorMessage.includes("Integrity constraint")) {
          setError("Unable to start chat. This user may no longer exist.");
        } else {
          setError("Failed to start chat. Please try again.");
        }
      }
    };
    
    initChat();
  }, [isOpen, contact, chatId]);

  // Fetch messages when chat is active
  const fetchMessages = useCallback(async () => {
    if (!activeChatId) return;
    
    setIsLoading(true);
    try {
      const fetchedMessages = await chatAPI.getMessages(activeChatId);
      setMessages(fetchedMessages);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChatId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!activeChatId || !isOpen) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [activeChatId, isOpen, fetchMessages]);

  useEffect(() => {
    if (!isOpen) return;
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

  const handleSend = async () => {
    if (!message.trim() || !activeChatId || isSending) return;
    
    const content = message.trim();
    setMessage("");
    setIsSending(true);
    
    // Optimistically add message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_id: activeChatId,
      sender_id: currentUserId,
      content,
      type: "text",
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      const sentMessage = await chatAPI.sendMessage(activeChatId, content);
      // Replace temp message with real one
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...sentMessage, sender_id: sentMessage.sender_id || currentUserId } : m
      ));
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setMessage(content); // Restore message
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };


  const renderInner = () => (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5d4e0] bg-[#f5f0f3]">
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <img 
              src={normalizeUrl(contact.avatar)} 
              alt={contact.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/icons/settings/profile.png";
              }}
            />
          </div>
          {contact.isOnline !== undefined && (
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                contact.isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-900">{contact.name}</div>
          <div className="text-xs text-gray-500">
            {contact.isOnline ? (
              <span className="text-green-500">Online</span>
            ) : (
              "Offline"
            )}
          </div>
        </div>
        {!inline && (
          <button
            onClick={onClose}
            className="text-[#7b2030] hover:text-[#5a1820] transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfcfc]">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-center px-4">{error}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 text-sm text-[#7b2030] hover:bg-[#7b2030]/10 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        ) : isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b2030]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((m) => {
            const isFromMe = m.sender_id === currentUserId;
            return (
              <div
                key={m.id}
                className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isFromMe
                      ? "bg-[#7b2030] text-white"
                      : "bg-[#e8e0d8] text-gray-900"
                  }`}
                >
                  <div className="text-sm break-words">{m.content}</div>
                  <div className={`text-xs mt-1 ${isFromMe ? "text-white/70" : "text-gray-500"}`}>
                    {formatMessageTime(m.created_at)}
                    {isFromMe && m.is_read && (
                      <span className="ml-1">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-3 border-t border-[#e5d4e0] bg-white">
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-[#7b2030] hover:text-[#5a1820] transition-colors"
            aria-label="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#7b2030] placeholder-gray-400"
              disabled={isSending}
            />
          </div>

          <button
            className="p-2 text-[#7b2030] hover:text-[#5a1820] transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="p-2 bg-[#7b2030] text-white rounded-full hover:bg-[#5a1820] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  if (inline) {
    return (
      <div ref={ref} className="flex flex-col w-full h-full">
        {renderInner()}
      </div>
    );
  }

  const rightOffsetPx = 6 + 360 + 12;
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
