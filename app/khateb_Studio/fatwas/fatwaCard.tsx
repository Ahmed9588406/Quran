/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
// Using regular img tags instead of next/image for external URLs to avoid hostname configuration issues
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Fatwa Interface
 * Represents a single fatwa (Islamic religious question) submitted by a user
 * 
 * @property id - Unique identifier for the fatwa
 * @property question - The religious question asked by the user
 * @property answer - The preacher's answer (null if not yet answered)
 * @property status - Current status of the fatwa (pending, answered, rejected)
 * @property isAnonymous - Whether the asker chose to remain anonymous
 * @property asker - Information about the user who asked the question
 * @property targetPreacher - The preacher this fatwa was directed to
 * @property answeredBy - Information about the preacher who answered (if answered)
 * @property createdAt - Timestamp when the fatwa was created
 * @property answeredAt - Timestamp when the fatwa was answered (if answered)
 */
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
  answeredBy: any | null;
  createdAt: string;
  answeredAt: string | null;
}

/**
 * FatwaCardProps Interface
 * Props passed to the FatwaCard component from the parent FatwasPage
 * 
 * PREACHER CREDENTIALS & INFORMATION:
 * The preacher information is retrieved from localStorage in the parent component (page.tsx)
 * and passed down as props:
 * 
 * @property preacherName - Full name of the preacher (e.g., "Ahmed Al-Mansouri")
 *   - Retrieved from: localStorage.getItem("user") → user.firstName + user.lastName
 *   - Used to display the preacher's name in the answer input section
 *   - Defaults to "Anonymous" if not provided
 * 
 * @property preacherAvatar - Profile picture URL of the preacher
 *   - Retrieved from: localStorage.getItem("user") → user.profilePictureUrl
 *   - Used to display the preacher's avatar in the answer input section
 *   - Falls back to a gradient badge with the preacher's initials if not available
 * 
 * AUTHENTICATION:
 * The preacher's authentication token is stored in localStorage and used in the parent
 * component to make API requests:
 *   - Token keys: "access_token" or "token"
 *   - Used in handleAnswer() and handleReject() functions in page.tsx
 *   - Sent as: Authorization: Bearer {token}
 * 
 * @property fatwa - The fatwa object to display
 * @property onAnswer - Callback function when preacher submits an answer
 * @property onReject - Callback function when preacher rejects a fatwa
 */
interface FatwaCardProps {
  fatwa: Fatwa;
  preacherName?: string;
  preacherAvatar?: string;
  onAnswer?: (id: string, answer: string) => void;
  onReject?: (id: string) => void;
}

/**
 * Utility function to convert absolute timestamps to relative time format
 * Used to display when a fatwa was created (e.g., "2h", "Just now")
 */
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

/**
 * FatwaCard Component
 * 
 * Displays a single fatwa card with:
 * 1. Asker information (name, avatar, timestamp)
 * 2. The question text
 * 3. Action buttons (Repost, Reject)
 * 4. Answer input section with preacher credentials
 * 
 * PREACHER CREDENTIALS DISPLAY:
 * The preacher's name and avatar are displayed in the answer input section (bottom of card).
 * This shows who will be answering the fatwa:
 * - Preacher Name: Displayed as a label above the answer textarea
 * - Preacher Avatar: Displayed as a circular profile picture to the left of the input
 * 
 * These credentials come from the parent component (page.tsx) which retrieves them from:
 * - localStorage.getItem("user") for the preacher's profile data
 * - The preacher is authenticated via their access token stored in localStorage
 * 
 * @param fatwa - The fatwa object containing question, asker info, and status
 * @param preacherName - Name of the preacher answering (from localStorage user data)
 * @param preacherAvatar - Avatar URL of the preacher (from localStorage user data)
 * @param onAnswer - Callback to submit the answer (handled by parent component)
 * @param onReject - Callback to reject the fatwa (handled by parent component)
 */
export default function FatwaCard({
  fatwa,
  preacherName = "Anonymous",
  preacherAvatar,
  onAnswer,
  onReject,
}: FatwaCardProps) {
  // Local state for the preacher's answer text
  const [answer, setAnswer] = useState("");
  // Track submission state to prevent duplicate submissions
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log the logged-in preacher's credentials when component mounts
  // This helps verify that the correct preacher is viewing and answering fatwas
  useEffect(() => {
    console.log("=== FATWA CARD LOADED ===");
    console.log("Logged-in Preacher Information:");
    console.log("  Name:", preacherName);
    console.log("  Avatar URL:", preacherAvatar || "No avatar provided");
    console.log("  Fatwa ID:", fatwa.id);
    console.log("  Question from:", fatwa.isAnonymous ? "Anonymous User" : fatwa.asker?.firstName + " " + fatwa.asker?.lastName);
    console.log("================================");
  }, [preacherName, preacherAvatar, fatwa.id]);

  // Determine the name of the person who asked the question
  // If anonymous, display "Anonymous", otherwise show their full name
  const askerName = fatwa.isAnonymous
    ? "Anonymous"
    : fatwa.asker
    ? fatwa.asker.displayName || `${fatwa.asker.firstName || ""} ${fatwa.asker.lastName || ""}`.trim() || fatwa.asker.username || "Anonymous"
    : "Anonymous";

  // Get the asker's profile picture (null if anonymous)
  const askerAvatar = fatwa.isAnonymous ? null : (fatwa.asker?.avatarUrl || fatwa.asker?.profilePictureUrl);

  /**
   * Handles submission of the preacher's answer
   * 
   * Flow:
   * 1. Validates answer text is not empty
   * 2. Shows loading toast notification
   * 3. Calls the onAnswer callback from the parent component
   * 4. Parent component sends answer to backend API:
   *    - Endpoint: PUT https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/fatwas/{fatwaID}/answer
   *    - Method: PUT
   *    - Headers: Authorization: Bearer {token}, Content-Type: application/json
   *    - Body: { "answer": "string" }
   * 5. Shows success toast notification
   * 6. After successful submission, fatwa is removed from the list
   * 7. Clears the answer input field
   */
  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !onAnswer) return;
    
    setIsSubmitting(true);
    
    // Show loading toast
    const toastId = toast.loading("📤 Submitting your answer...", {
      position: "top-right",
      autoClose: false,
    });
    
    console.log("[FatwaCard] Submitting answer:", {
      fatwaId: fatwa.id,
      answerLength: answer.length,
      preacher: preacherName,
    });
    
    try {
      // Call the parent's onAnswer handler which makes the API request
      await onAnswer(fatwa.id, answer);
      
      // Clear the answer field after successful submission
      setAnswer("");
      
      // Update toast to success
      toast.update(toastId, {
        render: "✅ Answer submitted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
      });
      
      console.log("[FatwaCard] ✓ Answer submitted successfully for fatwa:", fatwa.id);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to submit answer";
      
      // Update toast to error
      toast.update(toastId, {
        render: `❌ ${errorMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
        closeButton: true,
      });
      
      console.error("[FatwaCard] Error submitting answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 max-w-2xl w-full">
      {/* 
        SECTION 1: Header - Asker Information
        Displays who asked the question with their avatar and timestamp
      */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {askerAvatar ? (
            <img
              src={askerAvatar}
              alt={askerName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8A1538] to-[#6B102C] text-white font-semibold text-lg ${askerAvatar ? 'hidden' : ''}`}>
            {askerName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{askerName}</span>
          <span className="text-sm text-[#8A1538]">
            {getRelativeTime(fatwa.createdAt)}
          </span>
        </div>
      </div>

      {/* 
        SECTION 2: Question Text
        Displays the religious question asked by the user
      */}
      <p className="text-gray-800 text-base mb-4 leading-relaxed">
        {fatwa.question}
      </p>

      {/* 
        SECTION 2.5: Previous Answer (if exists)
        Displays the preacher's previous answer if the fatwa has already been answered
      */}
      {fatwa.answer && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-green-900 text-sm mb-1">Previous Answer</h4>
              <p className="text-green-800 text-sm leading-relaxed">{fatwa.answer}</p>
              {fatwa.answeredAt && (
                <p className="text-green-700 text-xs mt-2">
                  Answered {getRelativeTime(fatwa.answeredAt)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 
        SECTION 3: Action Buttons
        Allows the preacher to repost or reject the fatwa
        These actions are handled by the parent component (page.tsx) which:
        - Uses the preacher's authentication token from localStorage
        - Makes API calls to the backend
        - Updates the fatwa list after successful action
      */}
      <div className="flex items-center gap-6 mb-4 border-b border-gray-100 pb-4">
       
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

      {/* 
        SECTION 4: Answer Input Section - PREACHER CREDENTIALS DISPLAY
        
        This section displays the preacher's credentials and allows them to compose an answer.
        
        PREACHER INFORMATION DISPLAYED:
        1. Preacher Avatar (left side):
           - Source: preacherAvatar prop from parent component
           - Retrieved from: localStorage.getItem("user").profilePictureUrl
           - Fallback: Gradient badge with preacher's first initial
           - Size: 40x40 pixels
        
        2. Preacher Name (above textarea):
           - Source: preacherName prop from parent component
           - Retrieved from: localStorage.getItem("user").firstName + lastName
           - Default: "Anonymous" if not provided
           - Font: Semibold, 14px
        
        AUTHENTICATION FLOW:
        When the preacher submits an answer:
        1. The answer text is sent to handleSubmitAnswer()
        2. handleSubmitAnswer() calls onAnswer() callback from parent
        3. Parent component (page.tsx) uses preacher's auth token from localStorage
        4. Token is sent as: Authorization: Bearer {token}
        5. API endpoint: POST /api/khateb_Studio/fatwas
        6. After successful submission, the fatwa is removed from the list
      */}
      <div className="flex items-start gap-3">
        {/* Preacher Avatar Display */}
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
          {/* Fallback: Gradient badge with preacher's initials */}
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-[#8A1538] to-[#6B102C] text-white font-medium text-sm ${preacherAvatar ? 'hidden' : ''}`}>
            {preacherName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          {/* Preacher Name Label */}
          <span className="font-semibold text-gray-900 text-sm block mb-2">
            {preacherName}
          </span>
          {/* Answer Textarea - where preacher types their response */}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="write here..."
            className="w-full bg-[#FFF8E7] rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#8A1538]/20 min-h-[60px]"
            rows={2}
          />
          {/* Submit Button - appears only when answer text is not empty */}
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

      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
