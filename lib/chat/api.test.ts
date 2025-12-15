/**
 * Chat API Integration Tests
 * 
 * Tests the chat API integration with the backend at http://apisoapp.twingroups.com
 * Run with: npx vitest run lib/chat/api.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatAPI, ChatAPIError, API_BASE_URL } from './api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('ChatAPI', () => {
  let api: ChatAPI;
  const mockToken = 'test-jwt-token';

  beforeEach(() => {
    api = new ChatAPI(API_BASE_URL);
    localStorageMock.getItem.mockReturnValue(mockToken);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('listChats', () => {
    it('should fetch chats from /chat/list endpoint', async () => {
      const mockChats = [
        { id: '1', type: 'direct', participants: [], unread_count: 0, created_at: '2024-01-01' },
        { id: '2', type: 'group', title: 'Test Group', participants: [], unread_count: 2, created_at: '2024-01-02' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, chats: mockChats }),
      });

      const result = await api.listChats();

      // Verify the endpoint is correct
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/list`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockChats);
    });

    it('should return empty array when no chats', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, chats: [] }),
      });

      const result = await api.listChats();
      expect(result).toEqual([]);
    });
  });

  describe('createChat', () => {
    it('should create a direct chat via /chat/create endpoint', async () => {
      const targetUserId = 'user-123';
      const mockChatId = 'chat-456';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, chat_id: mockChatId }),
      });

      const result = await api.createChat(targetUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/create`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ target_user_id: targetUserId }),
        })
      );
      expect(result).toEqual({ chat_id: mockChatId });
    });
  });

  describe('getMessages', () => {
    it('should fetch messages from /chat/:chatId/messages endpoint', async () => {
      const chatId = 'chat-123';
      const mockMessages = [
        { id: 'm1', chat_id: chatId, sender_id: 'u1', content: 'Hello', type: 'text', created_at: '2024-01-01', is_read: true },
        { id: 'm2', chat_id: chatId, sender_id: 'u2', content: 'Hi!', type: 'text', created_at: '2024-01-01', is_read: false },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, messages: mockMessages }),
      });

      const result = await api.getMessages(chatId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`${API_BASE_URL}/chat/${chatId}/messages`),
        expect.any(Object)
      );
      expect(result).toEqual(mockMessages);
    });

    it('should include filter and search params when provided', async () => {
      const chatId = 'chat-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, messages: [] }),
      });

      await api.getMessages(chatId, { filter: 'media', search: 'test', limit: 20 });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('filter=media');
      expect(calledUrl).toContain('search=test');
      expect(calledUrl).toContain('limit=20');
    });
  });

  describe('sendMessage', () => {
    it('should send a text message via /chat/:chatId/message endpoint', async () => {
      const chatId = 'chat-123';
      const content = 'Hello World';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message_id: 'msg-456' }),
      });

      const result = await api.sendMessage(chatId, content);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/${chatId}/message`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ content }),
        })
      );
      expect(result.id).toBe('msg-456');
      expect(result.content).toBe(content);
      expect(result.type).toBe('text');
    });
  });

  describe('sendMedia', () => {
    it('should send media via /chat/:chatId/message/:type endpoint', async () => {
      const chatId = 'chat-123';
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const type = 'image';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message_id: 'msg-789', media_url: '/uploads/test.jpg' }),
      });

      const result = await api.sendMedia(chatId, file, type);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/${chatId}/message/${type}`,
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.type).toBe('image');
      expect(result.media_url).toBe('/uploads/test.jpg');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message via /chat/message/:messageId endpoint', async () => {
      const messageId = 'msg-123';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.deleteMessage(messageId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/message/${messageId}`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('createGroup', () => {
    it('should create a group via /chat/group/create endpoint', async () => {
      const title = 'Test Group';
      const memberIds = ['user-1', 'user-2'];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, chat_id: 'group-123' }),
      });

      const result = await api.createGroup(title, memberIds);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/group/create`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ title, member_ids: memberIds }),
        })
      );
      expect(result).toEqual({ chat_id: 'group-123' });
    });
  });

  describe('addMember', () => {
    it('should add a member via /chat/group/:chatId/add endpoint', async () => {
      const chatId = 'group-123';
      const userId = 'user-456';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.addMember(chatId, userId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/group/${chatId}/add`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ user_id: userId }),
        })
      );
    });
  });

  describe('removeMember', () => {
    it('should remove a member via /chat/group/:chatId/remove endpoint', async () => {
      const chatId = 'group-123';
      const userId = 'user-456';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await api.removeMember(chatId, userId);

      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/chat/group/${chatId}/remove`,
        expect.objectContaining({
          method: 'DELETE',
          body: JSON.stringify({ user_id: userId }),
        })
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users via /search/users endpoint', async () => {
      const query = 'john';
      const mockUsers = [
        { id: 'u1', username: 'john_doe', status: 'online' },
        { id: 'u2', username: 'johnny', status: 'offline' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, users: mockUsers }),
      });

      const result = await api.searchUsers(query);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`${API_BASE_URL}/search/users`),
        expect.any(Object)
      );
      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain(`q=${query}`);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('error handling', () => {
    it('should throw ChatAPIError on failed requests', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'UNAUTHORIZED', message: 'Invalid token' }),
      });

      await expect(api.listChats()).rejects.toThrow(ChatAPIError);
    });

    it('should include error details in ChatAPIError', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'NOT_FOUND', message: 'Chat not found' }),
      });

      try {
        await api.getChatDetails('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(ChatAPIError);
        expect((error as ChatAPIError).statusCode).toBe(404);
        expect((error as ChatAPIError).message).toBe('Chat not found');
      }
    });
  });
});

describe('API Endpoints Match Backend', () => {
  it('should use correct base URL', () => {
    expect(API_BASE_URL).toBe('http://apisoapp.twingroups.com');
  });

  it('should have all required endpoints configured', () => {
    const api = new ChatAPI();
    
    // Verify the API instance has all required methods
    expect(typeof api.listChats).toBe('function');
    expect(typeof api.createChat).toBe('function');
    expect(typeof api.getChatDetails).toBe('function');
    expect(typeof api.getMessages).toBe('function');
    expect(typeof api.sendMessage).toBe('function');
    expect(typeof api.sendMedia).toBe('function');
    expect(typeof api.deleteMessage).toBe('function');
    expect(typeof api.createGroup).toBe('function');
    expect(typeof api.addMember).toBe('function');
    expect(typeof api.removeMember).toBe('function');
    expect(typeof api.searchUsers).toBe('function');
    expect(typeof api.getUsers).toBe('function');
    expect(typeof api.getProfile).toBe('function');
  });
});
