/**
 * Tests for Chat API - Typing Indicator and Mark Seen Methods
 * 
 * Tests the sendTyping() and markAsSeen() methods
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatAPI } from './api';

// Mock fetch
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window.localStorage for Node.js environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
} else {
  // For Node.js test environment
  (global as any).localStorage = localStorageMock;
}

describe('ChatAPI - Typing Indicator and Mark Seen', () => {
  let chatAPI: ChatAPI;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    chatAPI = new ChatAPI('http://192.168.1.18:9001');
  });

  describe('sendTyping()', () => {
    it('should send typing start indicator', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.sendTyping('chat-123', true);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-123/typing',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({ is_typing: true }),
        })
      );
    });

    it('should send typing stop indicator', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.sendTyping('chat-123', false);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-123/typing',
        expect.objectContaining({
          body: JSON.stringify({ is_typing: false }),
        })
      );
    });

    it('should default to is_typing=true', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.sendTyping('chat-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ is_typing: true }),
        })
      );
    });

    it('should work without authorization token', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      await chatAPI.sendTyping('chat-123', true);

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-123/typing',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });

    it('should not throw on error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response('Error', { status: 500 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      // Should not throw
      await expect(chatAPI.sendTyping('chat-123', true)).resolves.toBeUndefined();
    });

    it('should log errors to console', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response('Error', { status: 500 })
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.sendTyping('chat-123', true);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorageMock.setItem('access_token', 'test-token');

      // Should not throw
      await expect(chatAPI.sendTyping('chat-123', true)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('markAsSeen()', () => {
    it('should mark all messages as seen', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.markAsSeen('chat-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-123/seen',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
          body: JSON.stringify({}),
        })
      );
    });

    it('should mark specific message as seen', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.markAsSeen('chat-123', 'msg-456');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-123/seen',
        expect.objectContaining({
          body: JSON.stringify({ message_id: 'msg-456' }),
        })
      );
    });

    it('should work without authorization token', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      await chatAPI.markAsSeen('chat-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-123/seen',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });

    it('should not throw on error', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response('Error', { status: 500 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      // Should not throw
      await expect(chatAPI.markAsSeen('chat-123')).resolves.toBeUndefined();
    });

    it('should log errors to console', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response('Error', { status: 500 })
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.markAsSeen('chat-123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorageMock.setItem('access_token', 'test-token');

      // Should not throw
      await expect(chatAPI.markAsSeen('chat-123')).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle different chat IDs', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.markAsSeen('chat-999');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/chats/chat-999/seen',
        expect.any(Object)
      );
    });

    it('should handle different message IDs', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await chatAPI.markAsSeen('chat-123', 'msg-999');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ message_id: 'msg-999' }),
        })
      );
    });
  });

  describe('Integration', () => {
    it('should handle rapid typing indicator calls', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      // Simulate rapid typing
      await Promise.all([
        chatAPI.sendTyping('chat-123', true),
        chatAPI.sendTyping('chat-123', true),
        chatAPI.sendTyping('chat-123', false),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent typing and seen calls', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      localStorageMock.setItem('access_token', 'test-token');

      await Promise.all([
        chatAPI.sendTyping('chat-123', true),
        chatAPI.markAsSeen('chat-123'),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
