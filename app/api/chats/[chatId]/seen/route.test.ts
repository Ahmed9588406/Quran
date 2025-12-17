/**
 * Tests for Mark Seen API Route
 * 
 * Tests the POST /api/chats/[chatId]/seen endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = vi.fn();

describe('Mark Seen API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('OPTIONS', () => {
    it('should return 204 with CORS headers', async () => {
      const response = await OPTIONS();
      expect(response.status).toBe(204);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
      expect(response.headers.get('Access-Control-Allow-Headers')).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should mark all messages as seen when no message_id provided', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({}),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://apisoapp.twingroups.com/chat/chat-123/seen',
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

    it('should mark specific message as seen when message_id provided', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({ message_id: 'msg-456' }),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://apisoapp.twingroups.com/chat/chat-123/seen',
        expect.objectContaining({
          body: JSON.stringify({ message_id: 'msg-456' }),
        })
      );
    });

    it('should handle backend errors', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response('Backend error', { status: 500 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({}),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });

      expect(response.status).toBe(500);
    });

    it('should work without authorization header', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map(),
        json: async () => ({}),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });

      expect(response.status).toBe(200);
    });

    it('should include CORS headers in response', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({}),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should handle different chat IDs', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({}),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-999' });

      const response = await POST(req, { params });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://apisoapp.twingroups.com/chat/chat-999/seen',
        expect.any(Object)
      );
    });
  });
});
