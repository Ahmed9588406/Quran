import React, { useEffect, useRef, useMemo, useState } from "react";
import Image from "next/image";

type User = { id: string; name: string; avatar: string };

export default function StartNewMessage({
  isOpen,
  onClose,
  users,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSelect: (u: User) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [users, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60">
      <div className="absolute inset-0 bg-black/40" onClick={() => onClose()} />
      <div
        ref={ref}
        id="start-new-modal"
        className="absolute right-6 bottom-28 w-[360px] max-w-[92vw] bg-[#fff6f3] rounded-2xl shadow-xl border border-[#f0e6e5] p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-[#7b2030]">New Message</div>
          <button aria-label="Close" onClick={() => onClose()} className="text-[#7b2030]">Close</button>
        </div>

        <div className="mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md border-gray-200 focus:outline-none text-black placeholder-black"
            autoFocus
          />
        </div>

        <div className="max-h-56 overflow-auto space-y-2">
          {filtered.length ? (
            filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  onSelect(u);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 text-left"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <Image src={u.avatar} alt={u.name} width={40} height={40} style={{ objectFit: "cover" }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-black">{u.name}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-sm text-gray-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
