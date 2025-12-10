'use client';

/**
 * Message Input Component
 * 
 * Text input with send button, attachment button, and voice recording.
 * Requirements: 3.1, 3.4, 4.1, 4.3, 6.1, 7.1, 7.2
 * 
 * **Feature: real-time-chat-system, Property 7: Input cleared after send**
 * **Feature: real-time-chat-system, Property 8: Typing indicator debounce**
 */

import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Mic, Square, Smile } from 'lucide-react';
import { useVoiceRecorder } from '@/lib/chat/useVoiceRecorder';
import { chatAPI } from '@/lib/chat/api';
import { wsManager } from '@/lib/chat/websocket';

interface MessageInputProps {
  chatId: string;
  onSendMessage: (content: string) => Promise<void>;
  onSendMedia: (file: File, type: 'image' | 'video' | 'audio') => Promise<void>;
  disabled?: boolean;
}

export default function MessageInput({
  chatId,
  onSendMessage,
  onSendMedia,
  disabled = false,
}: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isRecording, startRecording, stopRecording, error: recordingError } = useVoiceRecorder();

  /**
   * Handles sending a text message.
   * Clears input after send (Property 7).
   */
  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending || disabled) return;

    setIsSending(true);
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

    let type: 'image' | 'video' | 'audio' = 'image';
    if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

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
    <div className="flex items-center gap-2 p-3 bg-[#F0F2F5] border-t border-gray-200">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Emoji button (placeholder) */}
      <button
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-600"
        title="إيموجي"
      >
        <Smile className="w-6 h-6" />
      </button>

      {/* Attachment button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-gray-600"
        title="إرفاق ملف"
        disabled={disabled}
      >
        <Paperclip className="w-6 h-6" />
      </button>

      {/* Text input */}
      <div className="flex-1 bg-white rounded-lg px-4 py-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="اكتب رسالة..."
          className="w-full bg-transparent focus:outline-none text-gray-900 text-sm"
          disabled={disabled || isRecording}
        />
      </div>

      {/* Mic / Send button */}
      {input.trim() ? (
        <button
          onClick={handleSend}
          disabled={isSending || disabled}
          className="w-11 h-11 flex items-center justify-center rounded-full transition-all hover:scale-105 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          title="إرسال"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      ) : (
        <button
          onClick={handleRecordingToggle}
          disabled={disabled}
          className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
            isRecording
              ? 'bg-red-500 animate-pulse'
              : 'hover:bg-gray-200 text-gray-600'
          }`}
          title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
        >
          {isRecording ? (
            <Square className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      )}

      {/* Recording error */}
      {recordingError && (
        <div className="absolute bottom-16 left-4 right-4 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
          {recordingError}
        </div>
      )}
    </div>
  );
}
