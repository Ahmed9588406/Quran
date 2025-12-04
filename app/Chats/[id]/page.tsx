"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import chats, { initialMessages, Message } from '../data';

export default function ChatDetailPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id ? Number(params.id) : null;
  const [messages, setMessages] = useState<Record<number, Message[]>>(initialMessages);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [id, messages]);

  if (!id) return <div className="p-8">No chat selected</div>;

  const sendMessage = () => {
    if (!id || !input.trim()) return;
    const msg: Message = { id: String(Date.now()), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages((prev) => ({ ...prev, [id]: [...(prev[id] || []), msg] }));
    setInput('');
  };

  const chat = chats.find((c) => c.id === id);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/Chats')}>Back</button>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <Image src={chat?.avatar || '/figma-assets/avatar-2404-27141.png'} alt="avatar" width={40} height={40} />
          </div>
          <div>
            <div className="text-sm font-medium">{chat?.name}</div>
            <div className="text-xs text-gray-500">last seen 5 mins ago</div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-6 bg-[#FAFAFB]">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {(messages[id] || []).map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${m.from === 'me' ? 'bg-[#8A1538] text-white' : 'bg-white text-gray-800'} px-4 py-2 rounded-lg shadow-sm max-w-[70%]`}>
                <div className="text-sm">{m.text}</div>
                <div className="text-xs text-gray-400 mt-1 text-right">{m.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} placeholder="Write a message" className="flex-1 border rounded-full px-4 py-2 focus:outline-none" />
          <button onClick={sendMessage} className="bg-[#8A1538] text-white px-4 py-2 rounded-full">Send</button>
        </div>
      </div>
    </div>
  );
}
