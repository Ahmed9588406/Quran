/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getAuthToken } from '@/lib/auth';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AskImam({ isOpen, onClose }: Props) {
  const [questionShort, setQuestionShort] = useState('');
  const [questionDetail, setQuestionDetail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [targetPreacherId, setTargetPreacherId] = useState<string | null>(null);
  const [selectedPreacherName, setSelectedPreacherName] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // listen for sheikh selection events from the modal
  useEffect(() => {
    const onSheikhSelected = (e: any) => {
      try {
        const s = e?.detail;
        if (s && s.id) {
          setTargetPreacherId(s.id);
          setSelectedPreacherName(s.name ?? null);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('sheikh-selected', onSheikhSelected as EventListener);
    return () => window.removeEventListener('sheikh-selected', onSheikhSelected as EventListener);
  }, []);

  const openSheikhModal = () => {
    try {
      window.dispatchEvent(new CustomEvent('open-sheikh-modal'));
    } catch {}
    try {
      const w = window as any;
      if (typeof w.openSheikhModal === 'function') w.openSheikhModal();
      else if (typeof w.__openSheikhModal === 'function') w.__openSheikhModal();
    } catch {}
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);
    // validation
    if (!questionShort || !questionShort.trim()) {
      setError('Short question is required');
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setError('You must be logged in to ask an imam');
      return;
    }

    const payload: any = {
      question: questionShort.trim(),
      isAnonymous: !!isAnonymous,
    };
    if (targetPreacherId) payload.targetPreacherId = targetPreacherId;
    // optionally include details in separate field if API supports, else append to question
    if (questionDetail && questionDetail.trim()) {
      // append details to question or use "details" if accepted by API
      payload.question = `${payload.question}\n\n${questionDetail.trim()}`;
    }

    setPosting(true);
    try {
      const res = await fetch('/user/api/fatwas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text().catch(() => '');
      let parsed: any = null;
      try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }

      if (!res.ok) {
        const msg = parsed?.message || parsed?.error || JSON.stringify(parsed) || `Request failed (${res.status})`;
        setError(String(msg));
        setPosting(false);
        return;
      }

      // success
      // you can surface a toast instead; using alert for simplicity
      alert('Fatwa posted successfully');
      // reset form
      setQuestionShort('');
      setQuestionDetail('');
      setIsAnonymous(false);
      setTargetPreacherId(null);
      setSelectedPreacherName(null);
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Network error');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* modal */}
      <div className="relative w-full max-w-2xl bg-[#fff6f3] border border-[#f0e6e5] rounded-xl shadow-lg overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden relative">
              <Image src="/icons/settings/profile.png" alt="avatar" fill style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#7b2030]">Mazen Mohamed</div>
              <div className="text-xs text-gray-500">2d</div>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* inputs */}
        <div className="px-4 pb-4">
          <div className="relative mb-3">
            <input
              placeholder="Ask a question and start it with what , why and how ?"
              className="w-full h-10 rounded-md border border-[#e6d7d5] px-3 pr-12 text-sm bg-white text-black"
              value={questionShort}
              onChange={(e) => setQuestionShort(e.target.value)}
            />
            <button
                type="button"
                onClick={openSheikhModal}
                aria-label="Choose sheikh"
                className="absolute top-1 right-1 p-0"
            >
                <Image
                    src="/icons/team.svg"
                    alt="Team Illustration"
                    width={30}
                    height={30}
                    className="select-none"
                />
            </button>
          </div>

          <textarea
            placeholder="Explain your question"
            className="w-full h-48 rounded-md border border-[#e6d7d5] p-3 text-sm bg-white text-black resize-none"
            value={questionDetail}
            onChange={(e) => setQuestionDetail(e.target.value)}
          />

          <div className="flex items-center justify-between mt-3 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => setIsAnonymous(!isAnonymous)}
                className="h-4 w-4"
              />
              <span>Ask anonymously</span>
            </label>

            <div className="text-sm">
              {selectedPreacherName ? (
                <span className="text-sm">Target: <strong>{selectedPreacherName}</strong></span>
              ) : (
                <span className="text-sm text-gray-500">No target preacher</span>
              )}
            </div>
          </div>

          {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-transparent">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm border border-[#f0e6e5] bg-white"
            disabled={posting}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm text-white bg-[#7b2030] hover:bg-[#5e0e27]"
            onClick={handleSubmit}
            disabled={posting}
          >
            {posting ? 'Posting...' : 'Ask imam'}
          </button>
        </div>
      </div>
    </div>
  );
}
