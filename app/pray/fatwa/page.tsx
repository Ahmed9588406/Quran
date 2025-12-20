/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '../../user/navbar';
import LeftSide from '../../user/leftside';
import { Button } from '@/components/ui/button';
import StartNewMessage from '@/app/user/start_new_message';
import { ChevronDown, ChevronUp, RefreshCw, Search } from 'lucide-react';

const MessagesModal = dynamic(() => import('../../user/messages'), { ssr: false });

type AnsweredBy = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string;
  isVerified?: boolean;
};

type Asker = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string;
  isVerified?: boolean;
};

type Fatwa = {
  id: string;
  question: string;
  answer: string;
  status: string;
  isAnonymous: boolean;
  asker: Asker | null;
  targetPreacher: unknown | null;
  answeredBy: AnsweredBy | null;
  createdAt: string;
  answeredAt: string | null;
};

type FatwaResponse = {
  content: Fatwa[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
};

type Contact = {
  id: string;
  name: string;
  avatar: string;
};

function formatCompactDate(input?: string | null) {
  if (!input) return '';
  const dt = new Date(input);
  if (Number.isNaN(dt.getTime())) return input;
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(dt);
}

function toExcerpt(text: string, maxLen: number) {
  const t = (text ?? '').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

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
  const [expanded, setExpanded] = useState(false);
  const authorName = f.answeredBy?.displayName || f.answeredBy?.username || 'Preacher';
  const authorAvatar = f.answeredBy?.avatarUrl || '';
  const when = formatCompactDate(f.answeredAt || f.createdAt);

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <header className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0 overflow-hidden">
          {authorAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-semibold">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{authorName}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">{when}</span>
          </div>
          <h4 className="mt-2 text-base font-medium text-gray-800 leading-snug">
            {toExcerpt(f.question, 120) || '—'}
          </h4>
        </div>
      </header>
      
      <div className="mt-3 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
        {expanded ? f.answer : toExcerpt(f.answer, 200) || '—'}
      </div>
      
      <footer className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          className="text-sm text-[#7b2030] font-medium inline-flex items-center gap-1 hover:text-[#5e0e27] transition-colors"
          type="button"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              View More
            </>
          )}
        </button>
        <button className="text-xs text-gray-400 hover:text-gray-600">
          comment
        </button>
      </footer>
    </article>
  );
}

const startUsers: Contact[] = [
  { id: 'u1', name: 'Aisha Noor', avatar: 'https://i.pravatar.cc/80?img=21' },
  { id: 'u2', name: 'Bilal Y', avatar: 'https://i.pravatar.cc/80?img=17' },
];

export default function Page() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('pray');

  // Remote fatwas state
  const [fatwas, setFatwas] = useState<Fatwa[]>([]);
  const [loadingFatwas, setLoadingFatwas] = useState(false);
  const [fatwasError, setFatwasError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;
  const [hasMore, setHasMore] = useState(true);

  // Messaging state
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);

  // Category search query
  const [categoryQuery, setCategoryQuery] = useState('');

  const fatwaCountLabel = useMemo(() => {
    if (loadingFatwas) return 'Loading…';
    if (fatwasError) return 'Error';
    return `${fatwas.length} Fatwas`;
  }, [fatwas.length, fatwasError, loadingFatwas]);

  const filteredCategories = useMemo(() => {
    if (!categoryQuery.trim()) return categories;
    const q = categoryQuery.toLowerCase();
    return categories.filter(cat => cat.toLowerCase().includes(q));
  }, [categoryQuery]);

  const fetchAnsweredFatwas = async (opts?: { page?: number; append?: boolean }) => {
    const pageToLoad = opts?.page ?? 0;
    const append = opts?.append ?? false;

    setLoadingFatwas(true);
    setFatwasError(null);

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const url = `/pray/fatwa/my-fatwas/api?answered=true&page=${encodeURIComponent(
        String(pageToLoad)
      )}&size=${encodeURIComponent(String(pageSize))}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text().catch(() => '');
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = null;
      }

      if (!response.ok) {
        const detail = parsed?.error || parsed?.message || text || `HTTP ${response.status}`;
        throw new Error(detail);
      }

      const data = (parsed ?? {}) as FatwaResponse;
      console.log('Fatwa API response:', data);
      const items = Array.isArray(data.content) ? data.content : [];

      setFatwas((prev) => (append ? [...prev, ...items] : items));
      setPage(pageToLoad);
      setHasMore(data.last === true ? false : items.length === pageSize);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch fatwas';
      setFatwasError(msg);
    } finally {
      setLoadingFatwas(false);
    }
  };

  useEffect(() => {
    fetchAnsweredFatwas({ page: 0, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <NavBar onToggleSidebar={() => setSidebarOpen((s) => !s)} isSidebarOpen={isSidebarOpen} />
      <LeftSide
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={(v) => setActiveView(v)}
        activeView={activeView}
      />

      <main
        className="pt-16 min-h-screen pb-20"
        style={{
          backgroundImage: "url('/icons/settings/background.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundColor: '#fffaf9'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Page heading */}
          <div className="py-6">
            <h1 className="text-center text-[#7b2030] font-bold text-2xl">Fatwa</h1>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ml-60">
            {/* Main content - Left side (fatwas list) */}
            <section className="lg:col-span-10 space-y-5">
              {/* Top controls */}
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-600 font-medium">Showing {fatwaCountLabel}</div>
                <button
                  type="button"
                  onClick={() => fetchAnsweredFatwas({ page: 0, append: false })}
                  className="inline-flex items-center gap-2 text-sm px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  disabled={loadingFatwas}
                >
                  <RefreshCw className={`w-4 h-4 ${loadingFatwas ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* List */}
              <div className="space-y-4">
                {fatwasError ? (
                  <div className="bg-white border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    Failed to load fatwas: {fatwasError}
                  </div>
                ) : loadingFatwas && fatwas.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                    Loading answered fatwas…
                  </div>
                ) : fatwas.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                    No answered fatwas yet.
                  </div>
                ) : (
                  fatwas.map((f) => <FatwaCard key={f.id} f={f} />)
                )}
              </div>

              {/* Load more button */}
              {fatwas.length > 0 && (
                <div className="flex justify-center mt-6">
                  <button
                    className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-gray-50 transition-colors shadow-sm"
                    type="button"
                    disabled={loadingFatwas || !hasMore}
                    onClick={() => fetchAnsweredFatwas({ page: page + 1, append: true })}
                  >
                    {loadingFatwas ? 'Loading…' : hasMore ? 'Load more' : 'No more'}
                  </button>
                </div>
              )}
            </section>

            
          </div>
        </div>

        {/* Floating Messages button */}
        <div className="fixed right-8 bottom-8 z-50">
          <Button
            aria-label="Quick action"
            className="w-[143px] h-[56px] bg-[#7a1233] text-white rounded-[16px] inline-flex items-center justify-center gap-2 px-4 py-2 shadow-lg hover:bg-[#5e0e27] transition-colors"
            type="button"
            onClick={() => setIsMessagesOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="opacity-90">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-sm font-medium">Messages</span>
          </Button>
        </div>

        {/* Messages modal */}
        <MessagesModal
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          onOpenChat={() => {}}
          onOpenStart={() => {
            setIsMessagesOpen(false);
            setIsStartOpen(true);
          }}
        />

        {/* StartNewMessage modal */}
        <StartNewMessage
          isOpen={isStartOpen}
          onClose={() => setIsStartOpen(false)}
          users={startUsers.map(u => ({ id: u.id, name: u.name, avatar: u.avatar ?? 'https://i.pravatar.cc/80?img=1' }))}
          onSelect={() => {
            setIsStartOpen(false);
            setIsMessagesOpen(true);
          }}
        />
      </main>
    </>
  );
}