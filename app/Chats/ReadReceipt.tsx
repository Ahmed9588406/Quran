'use client';

/**
 * Read Receipt Component
 * 
 * Displays message read/seen status with visual indicators.
 * Integrated from chat_test.html seen functionality.
 * Requirements: 4.3, 10.1
 * 
 * **Feature: real-time-chat-system, Property 12: Read receipt display**
 */

import { Check } from 'lucide-react';

interface ReadReceiptProps {
  isRead: boolean;
  isSent: boolean;
  className?: string;
}

export default function ReadReceipt({ isRead, isSent, className = '' }: ReadReceiptProps) {
  if (!isSent) {
    return null;
  }

  return (
    <div className={`flex items-center ${className}`}>
      {isRead ? (
        // Double check marks (read/seen)
        <div className="flex -space-x-1" title="Seen">
          <Check className="w-3 h-3 text-blue-300" />
          <Check className="w-3 h-3 text-blue-300" />
        </div>
      ) : (
        // Single check mark (delivered)
        <div title="Delivered">
          <Check className="w-3 h-3 text-white/50" />
        </div>
      )}
    </div>
  );
}
