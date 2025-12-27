/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * ShareModal Component
 * 
 * Modal for sharing reels with copy link and share to chat options.
 * 
 * Requirements: 7.1, 7.2
 */

import React, { useState, useCallback } from 'react';
import { X, Link2, MessageCircle, Copy, Check, Send, Users } from 'lucide-react';
import { Reel } from '@/lib/reels/types';

export interface ShareModalProps {
  isOpen: boolean;
  reel: Reel | null;
  onClose: () => void;
  onShareToChat?: (reel: Reel, userId: string) => void;
}

interface ShareOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

/**
 * ShareModal - Displays sharing options for a reel
 * 
 * - Displays sharing options when user taps share button (Requirements: 7.1)
 * - Executes share actions: copy link, share to chat (Requirements: 7.2)
 */
export function ShareModal({ isOpen, reel, onClose, onShareToChat }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showChatList, setShowChatList] = useState(false);

  // Sample contacts for sharing to chat
  const contacts = [
    { id: "u1", name: "Aisha Noor", avatar: "https://i.pravatar.cc/80?img=21" },
    { id: "u2", name: "Bilal Y", avatar: "https://i.pravatar.cc/80?img=17" },
    { id: "u3", name: "Sara Ali", avatar: "https://i.pravatar.cc/80?img=11" },
    { id: "u4", name: "Omar Faruk", avatar: "https://i.pravatar.cc/80?img=12" },
    { id: "u5", name: "Layla Noor", avatar: "https://i.pravatar.cc/80?img=13" },
  ];

  /**
   * Copy reel link to clipboard
   * Requirements: 7.2 - Copy link option
   */
  const handleCopyLink = useCallback(async () => {
    if (!reel) return;
    
    const reelUrl = `${window.location.origin}/reels/${reel.id}`;
    
    try {
      await navigator.clipboard.writeText(reelUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [reel]);

  /**
   * Share using native share API
   */
  const handleNativeShare = useCallback(async () => {
    if (!reel) return;
    
    const reelUrl = `${window.location.origin}/reels/${reel.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reel by ${reel.username}`,
          text: reel.content || 'Check out this reel!',
          url: reelUrl,
        });
        onClose();
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [reel, onClose]);

  /**
   * Open chat list for sharing
   * Requirements: 7.2 - Send to chat option
   */
  const handleOpenChatList = useCallback(() => {
    setShowChatList(true);
  }, []);

  /**
   * Share to specific chat
   */
  const handleShareToContact = useCallback((contactId: string) => {
    if (!reel) return;
    
    if (onShareToChat) {
      onShareToChat(reel, contactId);
    }
    
    setShowChatList(false);
    onClose();
  }, [reel, onShareToChat, onClose]);

  /**
   * Close modal and reset state
   */
  const handleClose = useCallback(() => {
    setShowChatList(false);
    setCopied(false);
    onClose();
  }, [onClose]);

  // Don't render if not open or no reel
  if (!isOpen || !reel) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center" data-testid="share-modal">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={handleClose}
        data-testid="share-modal-backdrop"
      />
      
      {/* Modal Content */}
      <div className="relative z-[80] w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {showChatList ? 'Send to' : 'Share'}
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close share modal"
            data-testid="close-share-modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {showChatList ? (
            /* Chat List View - Requirements: 7.2 */
            <div className="space-y-2" data-testid="chat-list">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleShareToContact(contact.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  data-testid={`share-contact-${contact.id}`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="flex-1 text-left font-medium text-gray-800">
                    {contact.name}
                  </span>
                  <Send className="w-5 h-5 text-[#8A1538]" />
                </button>
              ))}
              
              {/* Back button */}
              <button
                onClick={() => setShowChatList(false)}
                className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                data-testid="back-to-share-options"
              >
                ← Back to share options
              </button>
            </div>
          ) : (
            /* Share Options View - Requirements: 7.1 */
            <div className="space-y-2" data-testid="share-options">
              {/* Copy Link Option */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                data-testid="copy-link-button"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Link2 className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <span className="flex-1 text-left font-medium text-gray-800">
                  {copied ? 'Link copied!' : 'Copy link'}
                </span>
                {!copied && <Copy className="w-5 h-5 text-gray-400" />}
              </button>

              {/* Send to Chat Option */}
              <button
                onClick={handleOpenChatList}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                data-testid="send-to-chat-button"
              >
                <div className="w-10 h-10 bg-[#8A1538]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-[#8A1538]" />
                </div>
                <span className="flex-1 text-left font-medium text-gray-800">
                  Send to chat
                </span>
                <Users className="w-5 h-5 text-gray-400" />
              </button>

              {/* Native Share Option (if available) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && typeof (navigator as any).share === 'function' && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  data-testid="native-share-button"
                >
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Send className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-800">
                    Share via...
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reel Preview */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            {reel.thumbnail_url ? (
              <img
                src={reel.thumbnail_url}
                alt="Reel thumbnail"
                className="w-12 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">
                {reel.username}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {reel.content || 'No caption'}
              </p>
            </div>
          </div>
        </div>

        {/* Safe area padding for mobile */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}

export default ShareModal;
