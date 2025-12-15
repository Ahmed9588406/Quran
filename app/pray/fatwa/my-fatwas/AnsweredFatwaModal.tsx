'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle, User, Calendar, MessageCircle } from 'lucide-react';

type AnsweredFatwa = {
  id: string;
  question: string;
  answer: string;
  status: string;
  isAnonymous: boolean;
  asker: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    isVerified: boolean;
  } | null;
  targetPreacher: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    isVerified: boolean;
  };
  answeredBy: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    isVerified: boolean;
  };
  createdAt: string;
  answeredAt: string;
};

type AnsweredFatwaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AnsweredFatwaModal({ isOpen, onClose }: AnsweredFatwaModalProps) {
  const [fatwas, setFatwas] = useState<AnsweredFatwa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFatwa, setSelectedFatwa] = useState<AnsweredFatwa | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAnsweredFatwas();
    }
  }, [isOpen]);

  const fetchAnsweredFatwas = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const response = await fetch('/pray/fatwa/my-fatwas/api?answered=true&page=0&size=50', {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      const text = await response.text();
      console.log('Fetch response status:', response.status);
      console.log('Fetch response text:', text);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${text || 'Failed to fetch answered fatwas'}`);
      }

      const data = JSON.parse(text);
      console.log('Answered fatwas response:', data);

      setFatwas(data.content || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      console.error('Error fetching answered fatwas:', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!isOpen) return null;

  // If a fatwa is selected, show the detailed view
  if (selectedFatwa) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
          onClick={() => setSelectedFatwa(null)}
        />

        {/* Detailed Modal */}
        <div className="relative w-full max-w-4xl bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF5ED] border-2 border-[#f0e6e5] rounded-3xl shadow-2xl p-8 z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
          {/* Decorative corners */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#7b2030]/10 via-[#7b2030]/5 to-transparent rounded-bl-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#7b2030]/10 via-[#7b2030]/5 to-transparent rounded-tr-[100px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="inline-block mb-3">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-[#7b2030] via-[#9a2a3f] to-[#7b2030] bg-clip-text text-transparent">
                  فتوى
                </h3>
                <div className="h-1 bg-gradient-to-r from-transparent via-[#7b2030] to-transparent rounded-full mt-1" />
              </div>
            </div>

            <button
              onClick={() => setSelectedFatwa(null)}
              className="group text-gray-400 hover:text-[#7b2030] p-2.5 rounded-full hover:bg-white/50 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
              aria-label="Close"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-5">
            {/* Question */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-[#f0e6e5]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7b2030] to-[#9a2a3f] flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-[#7b2030]">Question</h4>
              </div>
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {selectedFatwa.question}
              </p>
            </div>

            {/* Answer */}
            <div className="bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF5ED] rounded-2xl p-6 shadow-sm border-2 border-[#f0e6e5]">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7b2030] to-[#9a2a3f] flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#7b2030] mb-2">Answer</h4>
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedFatwa.answer}</p>
                </div>
              </div>
            </div>

            {/* Preacher Info */}
            <div className="bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF5ED] rounded-2xl p-6 shadow-sm border-2 border-[#f0e6e5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7b2030] to-[#9a2a3f] flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#7b2030]">Answered By</h4>
                  <p className="text-sm text-gray-700 mt-0.5 font-medium">
                    {selectedFatwa.answeredBy.displayName}
                    {selectedFatwa.answeredBy.isVerified && (
                      <span className="ml-1 text-[#7b2030]">✓</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-[#f0e6e5]">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#7b2030]" />
                  <span className="text-xs font-semibold text-[#7b2030]">Asked</span>
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  {new Date(selectedFatwa.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-[#f0e6e5]">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-[#7b2030]" />
                  <span className="text-xs font-semibold text-[#7b2030]">Answered</span>
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  {new Date(selectedFatwa.answeredAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center">
              <span className="px-4 py-2 rounded-full text-xs font-bold shadow-sm bg-gradient-to-r from-[#7b2030] to-[#9a2a3f] text-white border border-[#7b2030]">
                {selectedFatwa.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 flex justify-end gap-3 mt-8 pt-6 border-t-2 border-[#f0e6e5]">
            <button
              onClick={() => setSelectedFatwa(null)}
              className="group px-6 py-3 rounded-xl text-sm font-semibold border-2 border-[#7b2030] text-[#7b2030] hover:bg-gradient-to-r hover:from-[#7b2030] hover:to-[#9a2a3f] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl bg-gradient-to-br from-[#FFF9F3] via-white to-[#FFF5ED] border-2 border-[#f0e6e5] rounded-3xl shadow-2xl p-8 z-10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Decorative corners */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#7b2030]/10 via-[#7b2030]/5 to-transparent rounded-bl-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-[#7b2030]/10 via-[#7b2030]/5 to-transparent rounded-tr-[100px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <div className="inline-block mb-3">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-[#7b2030] via-[#9a2a3f] to-[#7b2030] bg-clip-text text-transparent">
                Answered Fatwas
              </h3>
              <div className="h-1 bg-gradient-to-r from-transparent via-[#7b2030] to-transparent rounded-full mt-1" />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {fatwas.length > 0 ? `${fatwas.length} answered fatwa${fatwas.length !== 1 ? 's' : ''}` : 'No answered fatwas'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="group text-gray-400 hover:text-[#7b2030] p-2.5 rounded-full hover:bg-white/50 transition-all duration-200 shadow-sm hover:shadow-md shrink-0"
            aria-label="Close"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-[#7b2030]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-[#7b2030] animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-500 font-medium">Loading answered fatwas...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <X className="w-10 h-10 text-red-600" />
            </div>
            <p className="text-red-600 mb-4 font-medium text-lg">{error}</p>
            <button
              onClick={fetchAnsweredFatwas}
              className="px-6 py-3 bg-gradient-to-r from-[#7b2030] to-[#9a2a3f] text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        ) : fatwas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7b2030]/10 to-[#9a2a3f]/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-[#7b2030]" />
            </div>
            <p className="text-gray-600 font-medium text-lg">No answered fatwas yet</p>
            <p className="text-gray-400 text-sm mt-2">Your answered fatwas will appear here</p>
          </div>
        ) : (
          <div className="relative z-10 flex-1 overflow-hidden">
            {/* Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {fatwas.map((fatwa, index) => (
                <button
                  key={fatwa.id}
                  onClick={() => setSelectedFatwa(fatwa)}
                  className="flex-shrink-0 w-96 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-[#f0e6e5] hover:shadow-xl hover:border-[#7b2030] transition-all duration-300 cursor-pointer text-left group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-[#7b2030]/10 to-[#9a2a3f]/10 text-[#7b2030]">
                          #{index + 1}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">
                          {new Date(fatwa.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-[#7b2030] shrink-0 group-hover:scale-110 transition-transform" />
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-[#7b2030]" />
                      <h4 className="text-xs font-bold text-[#7b2030]">Question</h4>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed group-hover:text-[#7b2030] transition-colors">
                      {fatwa.question}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="mb-4 p-4 bg-gradient-to-br from-[#FFF9F3] to-[#FFF5ED] rounded-xl border border-[#f0e6e5] group-hover:border-[#7b2030] transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-[#7b2030]" />
                      <h4 className="text-xs font-bold text-[#7b2030]">Answer</h4>
                    </div>
                    <p className="text-sm text-gray-800 line-clamp-3 leading-relaxed">
                      {fatwa.answer}
                    </p>
                  </div>

                  {/* Preacher Info */}
                  <div className="mb-4 p-3 bg-gradient-to-br from-[#FFF9F3] to-[#FFF5ED] rounded-xl border border-[#f0e6e5] group-hover:border-[#7b2030] transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7b2030] to-[#9a2a3f] flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#7b2030]">
                          {fatwa.answeredBy.displayName}
                          {fatwa.answeredBy.isVerified && (
                            <span className="ml-1">✓</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">Answered by</p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Asked: {new Date(fatwa.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#7b2030]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Answered: {new Date(fatwa.answeredAt).toLocaleString()}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Scroll Buttons */}
            {fatwas.length > 2 && (
              <>
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gradient-to-r from-[#7b2030] to-[#9a2a3f] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 -ml-4"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-gradient-to-r from-[#7b2030] to-[#9a2a3f] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 -mr-4"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="relative z-10 flex justify-end gap-3 mt-6 pt-6 border-t-2 border-[#f0e6e5]">
          <button
            onClick={onClose}
            className="group px-6 py-3 rounded-xl text-sm font-semibold border-2 border-[#7b2030] text-[#7b2030] hover:bg-gradient-to-r hover:from-[#7b2030] hover:to-[#9a2a3f] hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
