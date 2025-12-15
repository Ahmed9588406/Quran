'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';
import { Button } from '@/components/ui/button';
import StartNewMessage from '@/app/user/start_new_message';
import { ArrowBigRight } from 'lucide-react';

const MessagesModal = dynamic(() => import('../../user/messages'), { ssr: false });

type Fatwa = {
  id: number;
  author: string;
  title: string;
  excerpt: string;
  timeAgo: string;
};

// Contact type is declared later in this file to be used across messaging components.

const mockFatwas: Fatwa[] = [
  {
    id: 1,
    author: 'Mazen Mohamed',
    title: 'What The Messenger of Allah (ﷺ) said in Pillars of Prayer ?',
    excerpt:
      'The Messenger of Allah (ﷺ) said, "Allah the Almighty is Good and accepts only that which is good..."',
    timeAgo: '2d',
  },
  {
    id: 2,
    author: 'Mazen Mohamed',
    title: 'Rulings on Eating After Travel',
    excerpt:
      'The Almighty has said: "O you who believe! Eat of the lawful things that We have provided for you."...',
    timeAgo: '5d',
  },
  {
    id: 3,
    author: 'Mazen Mohamed',
    title: 'Audio Recitation Validity',
    excerpt:
      'If the recitation is done with proper tajweed and intention, it is valid for listening and reflection.',
    timeAgo: '1w',
  },
];

const categories = [
  'Basic Tenets of Faith',
  'Hadith & its Sciences',
  'The Quran and its Sciences',
  'Principles of Fiqh',
  'Etiquette, Morals and Heart-Softeners',
  'Knowledge & Propagation',
  'Psychological and Social Problems',
  'Islamic history and biography',
  'Pedagogy education and upbringing',
  'Fiqh of the family',
];

function FatwaCard({ f }: { f: Fatwa }) {
  return (
    <article className="bg-white dark:bg-gray-50 border border-[#f0e6e5] rounded-xl p-4 shadow-sm">
      <header className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#7b2030]">{f.author}</h3>
            <span className="text-xs text-gray-400">{f.timeAgo}</span>
          </div>
          <h4 className="mt-2 text-base font-medium text-gray-800">{f.title}</h4>
        </div>
      </header>
      <p className="mt-3 text-sm text-gray-600">{f.excerpt}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-sm text-gray-500">2 comments</div>
        <button className="text-sm text-[#7b2030] font-medium">View</button>
      </div>
    </article>
  );
}

type Contact = {
  id: string;
  name: string;
  avatar: string;
};

const startUsers: Contact[] = [
  { id: 'u1', name: 'Aisha Noor', avatar: 'https://i.pravatar.cc/80?img=21' },
  { id: 'u2', name: 'Bilal Y', avatar: 'https://i.pravatar.cc/80?img=17' },
];

export default function Page() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('pray');

  // Messaging state (copied from user page)
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);

  // Category search query (filter right-side categories)
  const [categoryQuery, setCategoryQuery] = useState('');

  return (
    <>
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} />
      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(v) => setActiveView(v)}
        activeView={activeView}
      />

      {/* Modified: apply background image from public/icons/settings/background.jpg */}
      <main
        className="pt-10 min-h-screen"
        style={{
          backgroundImage: "url('/icons/settings/background.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#fffaf9' // keep original color as fallback/blend
        }}
      >
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          {/* Page heading */}
          <div className="py-6">
            <h1 className="text-center text-[#7b2030] font-semibold text-lg">الفتوى</h1>
          </div>

          {/* Two-column layout: main list + right categories */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main content */}
            <section className="lg:col-span-8 space-y-4">
              {/* Top controls */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Showing {mockFatwas.length} Fatwas</div>
                {/* search removed from main page - moved to Category panel */}
              </div>

              {/* List */}
              <div className="space-y-4">
                {mockFatwas.map((f) => (
                  <FatwaCard key={f.id} f={f} />
                ))}
              </div>

              {/* Pagination placeholder */}
              <div className="flex justify-center mt-6">
                <button className="px-4 py-2 bg-white border border-[#f0e6e5] rounded-md text-sm">
                  Load more
                </button>
              </div>
            </section>

            {/* Right sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-20 space-y-4">
                <div className="bg-[#FFF9F3] border border-[#f0e6e5] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center">Category</h3>
                  {/* Category search (moved here from main page) */}
                  <div className="mb-3 bg-[#EFDEBC]">
                    <input
                      value={categoryQuery}
                      onChange={(e) => setCategoryQuery(e.target.value)}
                      placeholder="Search categories"
                      className="w-full px-3 py-2 rounded-md border text-sm text-[] bg-gray-50 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2 max-h-[60vh] overflow-auto pr-2">
                    {categories
                      .filter((c) => c.toLowerCase().includes(categoryQuery.trim().toLowerCase()))
                      .map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="text-sm text-gray-700">{c}</div>
                          <button className="text-xs text-[#7b2030]">view</button>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Floating Messages button (same place as user page) */}
        <div className="fixed right-8 bottom-8 z-50">
          <Button
            aria-label="Quick action"
            className="w-[143px] h-[56px] bg-[#7a1233] text-white rounded-[16px] inline-flex items-center justify-center gap-2 px-4 py-2 shadow-lg hover:bg-[#5e0e27]"
            type="button"
            onClick={() => setIsMessagesOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium">Messages</span>
          </Button>
        </div>

        {/* Messages modal - chat opens inline within the modal */}
        <MessagesModal
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          onOpenChat={() => {
            // Chat opens inline within MessagesModal, no separate ChatPanel needed
          }}
          onOpenStart={() => {
            setIsMessagesOpen(false);
            setIsStartOpen(true);
          }}
        />

        {/* StartNewMessage modal (local import) */}
        <StartNewMessage
          isOpen={isStartOpen}
          onClose={() => setIsStartOpen(false)}
          users={startUsers.map(u => ({ id: u.id, name: u.name, avatar: u.avatar ?? 'https://i.pravatar.cc/80?img=1' }))}
          onSelect={() => {
            // After selecting a user, open messages modal to start the chat
            setIsStartOpen(false);
            setIsMessagesOpen(true);
          }}
        />
      </main>
    </>
  );
}
