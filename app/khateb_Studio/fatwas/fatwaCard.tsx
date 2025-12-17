"use client";
import { useState } from "react";
import Image from "next/image";

interface Fatwa {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  isAnonymous: boolean;
  asker: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl: string | null;
  } | null;
  targetPreacher: any | null;
  answeredBy: any | null;
  createdAt: string;
  answeredAt: string | null;
}

interface FatwaCardProps {
  fatwa: Fatwa;
  preacherName?: string;
  preacherAvatar?: string;
  onAnswer?: (id: string, answer: string) => void;
  onReject?: (id: string) => void;
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export default function FatwaCard({
  fatwa,
  preacherName = "Anonymous",
  preacherAvatar,
  onAnswer,
  onReject,
}: FatwaCardProps) {
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const askerName = fatwa.isAnonymous
    ? "Anonymous"
    : fatwa.asker
    ? `${fatwa.asker.firstName} ${fatwa.asker.lastName}`
    : "Anonymous";

  const askerAvatar = fatwa.isAnonymous ? null : fatwa.asker?.profilePictureUrl;

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !onAnswer) return;
    setIsSubmitting(true);
    try {
      await onAnswer(fatwa.id, answer);
      setAnswer("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-w-2xl w-full">
      {/* Header - Asker info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {askerAvatar ? (
            <Image
              src={askerAvatar}
              alt={askerName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8A1538] to-[#6B102C] text-white font-semibold text-lg">
              {askerName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{askerName}</span>
          <span className="text-sm text-[#8A1538]">
            {getRelativeTime(fatwa.createdAt)}
          </span>
        </div>
      </div>

      {/* Question */}
      <p className="text-gray-800 text-base mb-4 leading-relaxed">
        {fatwa.question}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-6 mb-4 border-b border-gray-100 pb-4">
        <button
          onClick={() => onAnswer && answer.trim() && handleSubmitAnswer()}
          disabled={isSubmitting || !answer.trim()}
          className="flex items-center gap-2 text-gray-600 hover:text-[#8A1538] transition-colors disabled:opacity-50"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm font-medium">Repost</span>
        </button>

        <button
          onClick={() => onReject && onReject(fatwa.id)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <span className="text-sm font-medium">Reject</span>
        </button>
      </div>

      {/* Answer input section */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {preacherAvatar ? (
            <Image
              src={preacherAvatar}
              alt={preacherName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8A1538] to-[#6B102C] text-white font-medium text-sm">
              {preacherName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-900 text-sm block mb-2">
            {preacherName}
          </span>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="write here..."
            className="w-full bg-[#FFF8E7] rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#8A1538]/20 min-h-[60px]"
            rows={2}
          />
          {answer.trim() && (
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="mt-2 px-4 py-2 bg-[#8A1538] text-white rounded-lg text-sm font-medium hover:bg-[#6B102C] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
