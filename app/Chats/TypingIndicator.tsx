'use client';

/**
 * Typing Indicator Component
 * 
 * Displays typing status with animation.
 * Integrated from chat_test.html with enhanced styling.
 * Requirements: 4.2
 * 
 * **Feature: real-time-chat-system, Property 9: Typing indicator display**
 */

interface TypingIndicatorProps {
  typingUsers: string[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null;
  }

  // Format typing users text
  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return 'يكتب...';
    } else if (typingUsers.length === 2) {
      return 'يكتبان...';
    } else {
      return `${typingUsers.length} أشخاص يكتبون...`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500 italic flex items-center gap-2 animate-pulse">
      {/* Animated dots */}
      <div className="flex gap-1">
        <span 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '0ms' }} 
        />
        <span 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '150ms' }} 
        />
        <span 
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
          style={{ animationDelay: '300ms' }} 
        />
      </div>
      
      {/* Typing text */}
      <span className="flex items-center gap-1">
        <span>✍️</span>
        <span>{getTypingText()}</span>
      </span>
    </div>
  );
}
