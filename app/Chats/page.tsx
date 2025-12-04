"use client"
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import LeftSide from '../user/leftside';
import EmptyState from './EmptyState';
import ChatContent from './ChatContent';

const chats = [
	{ id: 1, name: "Groupe", time: "19:48", lastText: "Chatgram Web was updated.", unread: 1, avatar: "https://i.pravatar.cc/48?img=32" },
	{ id: 2, name: "Jessica Drew", time: "18:30", lastText: "Ok, see you later", unread: 2, avatar: "https://i.pravatar.cc/48?img=12" },
	{ id: 3, name: "David Moore", time: "18:16", lastText: "You: i don't remember anything 😄", unread: 0, avatar: "https://i.pravatar.cc/48?img=5" },
	{ id: 4, name: "Emily Dorson", time: "17:42", lastText: "Table for four, 5PM. Be there.", unread: 0, avatar: "https://i.pravatar.cc/48?img=7" },
	{ id: 5, name: "Art Class", time: "Tue", lastText: "Emily: Editorial", unread: 0, avatar: "https://i.pravatar.cc/48?img=15" },
];

type Message = { id: string; from: "me" | "them"; text: string; time?: string };

const initialMessages: Record<number, Message[]> = {
	1: [
		{ id: 'm1', from: 'them', text: 'Chatgram Web was updated.', time: '19:48' },
		{ id: 'm2', from: 'me', text: 'Nice!', time: '19:49' },
	],
	2: [
		{ id: 'm1', from: 'them', text: 'Ok, see you later', time: '18:30' },
	],
	3: [
		{ id: 'm1', from: 'them', text: "You: i don't remember anything 😄", time: '18:16' },
	],
	4: [
		{ id: 'm1', from: 'them', text: 'Table for four, 5PM. Be there.', time: '17:42' },
	],
	5: [
		{ id: 'm1', from: 'them', text: 'Emily: Editorial', time: 'Tue' },
	],
};

export default function ChatsPage() {
	const [selectedId, setSelectedId] = useState<number | null>(null);
	const router = useRouter();
	const [messages, setMessages] = useState<Record<number, Message[]>>(initialMessages);
	const [input, setInput] = useState('');
	const scrollRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// scroll to bottom so newest messages are visible (WhatsApp-style)
		const el = scrollRef.current;
		if (el) {
			el.scrollTop = el.scrollHeight;
		}
	}, [selectedId, messages]);

	const openChat = (id: number) => {
		// set local selection only — render chat content in the right pane (no navigation)
		setSelectedId(id);
		// optionally focus the input after selecting
		setTimeout(() => {
			const inputEl = document.querySelector('.chat-input') as HTMLInputElement | null;
			if (inputEl) inputEl.focus();
		}, 50);
	};



	// after sending, append message and scroll to bottom (newest at bottom)
	const sendMessage = () => {
		if (!selectedId || !input.trim()) return;
		const msg: Message = { id: String(Date.now()), from: 'me', text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
		setMessages((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), msg] }));
		setInput('');
		setTimeout(() => {
			const el = scrollRef.current;
			if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
		}, 50);
	};

	return (
		<div className="min-h-screen">
			{/* collapsed navigation */}
			<LeftSide isOpen={false} permanent onNavigate={() => { }} activeView="chats" />

			{/* Chat list column (fixed to the right of collapsed nav) */}
			{/* start at the top of the viewport */}
			<aside className="fixed top-0 left-14 bottom-0 w-[364px] bg-white border-r" style={{ borderColor: '#E5E7EB' }}>
				<div className="h-full overflow-auto">
					<div className="px-4 py-3 border-b" style={{ borderColor: '#F3F4F6' }}>
						<div className="text-lg font-semibold text-black">Chats</div>
					</div>
					<div className="p-2">
						{chats.map(c => (
							<button key={c.id} onClick={() => openChat(c.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 ${selectedId === c.id ? 'bg-gray-50' : ''}`}>
								<div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
									<Image src={c.avatar} alt={c.name} width={40} height={40} />
								</div>
								<div className="flex-1 text-left">
									<div className="flex items-center justify-between">
										<div className="text-sm font-medium">{c.name}</div>
										<div className="text-xs text-gray-400">{c.time}</div>
									</div>
									<div className="text-xs text-gray-500 truncate">{c.lastText}</div>
								</div>
								{c.unread ? (<div className="text-xs bg-[#8A1538] text-white px-2 py-1 rounded-full">{c.unread}</div>) : null}
							</button>
						))}
					</div>
				</div>
			</aside>

			{/* Content area: leave space for collapsed nav (56px) + chat list (364px) and navbar (h-16) */}
			{/* remove top padding so content begins at the very top */}
			<main className="flex-1 flex flex-col bg-white ml-[420px] pt-0">
				{selectedId ? (
					<ChatContent
						chat={chats.find(c => c.id === selectedId)}
						messages={messages[selectedId] || []}
						input={input}
						setInput={setInput}
						onSend={sendMessage}
						scrollRef={scrollRef}
					/>
				) : (
					<EmptyState />
				)}
			</main>
		</div>
	);
}