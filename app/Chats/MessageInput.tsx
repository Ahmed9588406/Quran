'use client';

/**
 * Message Input Component
 * 
 * Text input with send button, attachment button, voice recording, and emoji picker.
 * Requirements: 3.1, 3.4, 4.1, 4.3, 6.1, 7.1, 7.2
 * 
 * **Feature: real-time-chat-system, Property 7: Input cleared after send**
 * **Feature: real-time-chat-system, Property 8: Typing indicator debounce**
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Mic, Square, Smile, Image as ImageIcon, X } from 'lucide-react';
import { useVoiceRecorder } from '@/lib/chat/useVoiceRecorder';
import { wsManager } from '@/lib/chat/websocket';

interface MessageInputProps {
  chatId: string;
  onSendMessage: (content: string) => Promise<void>;
  onSendMedia: (file: File, type: 'image' | 'video' | 'audio' | 'document') => Promise<void>;
  disabled?: boolean;
}

// Common emoji categories
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
  'Objects': ['🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎮', '🎯', '🎲', '🎭', '🎨'],
  'Nature': ['🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🌿', '🍀', '🌴', '🌵', '🌲', '🌳', '🍁', '🍂', '🍃', '☀️', '🌙', '⭐', '🌈'],
  'Food': ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🍳', '🧇', '🥞', '🧈', '🍞', '🥐', '🥖', '🥨', '🧀', '🥗', '🥙', '🌮'],
};

export default function MessageInput({
  chatId,
  onSendMessage,
  onSendMedia,
  disabled = false,
}: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isRecording, startRecording, stopRecording, error: recordingError } = useVoiceRecorder();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handles emoji selection
   */
  const handleEmojiSelect = useCallback((emoji: string) => {
    setInput(prev => prev + emoji);
    inputRef.current?.focus();
  }, []);

  /**
   * Handles sending a text message.
   * Clears input after send (Property 7).
   */
  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending || disabled) return;

    setIsSending(true);
    setShowEmojiPicker(false);
    try {
      await onSendMessage(content);
      setInput(''); // Clear input after successful send
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, disabled, onSendMessage]);

  /**
   * Handles key press events.
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /**
   * Handles input change and sends typing indicator.
   * Implements debounce for stop-typing (Property 8).
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // Send typing indicator
    wsManager.sendTyping(chatId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to send stop-typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      wsManager.sendTyping(chatId, false);
    }, 1000);
  }, [chatId]);

  /**
   * Handles file selection for attachments.
   */
  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let type: 'image' | 'video' | 'audio' | 'document' = 'image';
    if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.type.startsWith('audio/')) {
      type = 'audio';
    } else if (
      file.type === 'application/pdf' ||
      file.type.includes('document') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('presentation') ||
      file.type === 'text/plain' ||
      file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)
    ) {
      type = 'document';
    }

    try {
      await onSendMedia(file, type);
    } catch (error) {
      console.error('Error sending file:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onSendMedia]);

  /**
   * Handles voice recording toggle.
   */
  const handleRecordingToggle = useCallback(async () => {
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        const file = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
        await onSendMedia(file, 'audio');
      }
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording, onSendMedia]);

  return (
    <div className="relative bg-white border-t border-gray-100">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
        >
          {/* Emoji Picker Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <div className="flex gap-1 overflow-x-auto">
              {Object.keys(EMOJI_CATEGORIES).map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveEmojiCategory(category)}
                  className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                    activeEmojiCategory === category
                      ? 'bg-[#8A1538] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="p-1 hover:bg-gray-100 rounded-full ml-2"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Emoji Grid */}
          <div className="p-3 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-10 gap-1">
              {EMOJI_CATEGORIES[activeEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Mic button */}
        <button
          onClick={handleRecordingToggle}
          disabled={disabled}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
            isRecording
              ? 'bg-red-500 animate-pulse'
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          title={isRecording ? 'Stop recording' : 'Voice message'}
        >
          {isRecording ? (
            <Square className="w-4 h-4 text-white" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Emoji button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors flex-shrink-0 ${
            showEmojiPicker ? 'bg-[#8A1538] text-white' : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
          title="Attach file"
          disabled={disabled}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Message"
            className="w-full bg-transparent focus:outline-none text-gray-900 text-sm placeholder-gray-400"
            disabled={disabled || isRecording}
          />
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending || disabled}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
            input.trim() 
              ? 'bg-[#8A1538] hover:bg-[#6d1029] text-white' 
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Recording error */}
      {recordingError && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
          {recordingError}
        </div>
      )}
    </div>
  );
}
