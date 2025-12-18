/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// Using regular img tags instead of next/image for external URLs to avoid hostname configuration issues

interface Fatwa {
  id: string;
  question: string;
  answer: string | null;
  status: string;
  isAnonymous: boolean;
  asker: {
    id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    displayName?: string;
    profilePictureUrl?: string | null;
    avatarUrl?: string | null;
  } | null;
  targetPreacher: any | null;
  answeredBy: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio?: string;
    isVerified?: boolean;
  } | null;
  createdAt: string;
  answeredAt: string | null;
}

interface AnsweredFatwaCardProps {
  fatwa: Fatwa;
  status: "answered" | "rejected";
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AnsweredFatwaCard({ fatwa, status }: AnsweredFatwaCardProps) {
  // Log the answered fatwa JSON
  console.log("=== ANSWERED FATWA JSON ===");
  console.log(JSON.stringify(fatwa, null, 2));
  console.log("Status:", status);
  console.log("===========================");

  // Get asker name
  const askerName = fatwa.isAnonymous
    ? "Anonymous"
    : fatwa.asker
    ? fatwa.asker.displayName || `${fatwa.asker.firstName || ""} ${fatwa.asker.lastName || ""}`.trim() || fatwa.asker.username || "Anonymous"
    : "Anonymous";

  // Get asker avatar
  const askerAvatar = fatwa.isAnonymous ? null : (fatwa.asker?.avatarUrl || fatwa.asker?.profilePictureUrl);

  // Get answering preacher info
  const preacherName = fatwa.answeredBy?.displayName || fatwa.answeredBy?.username || "Preacher";
  const preacherAvatar = fatwa.answeredBy?.avatarUrl || "";
  const isVerified = fatwa.answeredBy?.isVerified || false;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-w-2xl w-full">
      {/* Status Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          status === "answered" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {status === "answered" ? "✓ Answered" : "✗ Rejected"}
        </div>
        <span className="text-xs text-gray-400">
          {fatwa.answeredAt ? getRelativeTime(fatwa.answeredAt) : getRelativeTime(fatwa.createdAt)}
        </span>
      </div>

      {/* Asker Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {askerAvatar ? (
            <img
              src={askerAvatar}
              alt={askerName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to initials on image load error
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-500 text-white font-semibold text-sm ${askerAvatar ? 'hidden' : ''}`}>
            {askerName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 text-sm">{askerName}</span>
          <span className="text-xs text-gray-500">
            Asked {getRelativeTime(fatwa.createdAt)}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-1">Question</h4>
        <p className="text-gray-800 text-base leading-relaxed">
          {fatwa.question}
        </p>
      </div>

      {/* Answer Section (for answered fatwas) */}
      {status === "answered" && fatwa.answer && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            {/* Preacher Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              {preacherAvatar ? (
                <img
                  src={preacherAvatar}
                  alt={preacherName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8A1538] to-[#6B102C] text-white font-semibold text-sm ${preacherAvatar ? 'hidden' : ''}`}>
                {preacherName.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="flex-1">
              {/* Preacher Name with Verified Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-green-900 text-sm">{preacherName}</span>
                {isVerified && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Answer Text */}
              <p className="text-green-800 text-sm leading-relaxed">{fatwa.answer}</p>
              
              {/* Answered Time */}
              {fatwa.answeredAt && (
                <p className="text-green-700 text-xs mt-2">
                  Answered {getRelativeTime(fatwa.answeredAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejected Notice (for rejected fatwas) */}
      {status === "rejected" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 text-sm font-medium">This fatwa was rejected</span>
          </div>
          <p className="text-red-600 text-xs mt-2">
            The question did not meet the criteria for answering.
          </p>
        </div>
      )}

      {/* Footer with Fatwa ID */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Fatwa ID: {fatwa.id.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
