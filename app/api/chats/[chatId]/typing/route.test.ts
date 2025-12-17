/**
 * Tests for Typing Indicator API Route
 * 
 * Tests the POST /api/chats/[chatId]/typing endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, OPTIONS } from './route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = vi.fn();

describe('Typing Indicator API Route', () => {
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
    it('should send typing indicator with is_typing=true', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({ is_typing: true }),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://apisoapp.twingroups.com/chat/chat-123/typing',
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

    it('should send typing indicator with is_typing=false', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({ is_typing: false }),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-456' });

      const response = await POST(req, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://apisoapp.twingroups.com/chat/chat-456/typing',
        expect.any(Object)
      );
    });

    it('should return 400 if is_typing is not a boolean', async () => {
      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({ is_typing: 'yes' }),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('boolean');
    });

    it('should handle backend errors', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response('Backend error', { status: 500 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({ is_typing: true }),
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
        json: async () => ({ is_typing: true }),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });

      expect(response.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.anything(),
          }),
        })
      );
    });

    it('should include CORS headers in response', async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      );

      const req = {
        headers: new Map([['authorization', 'Bearer test-token']]),
        json: async () => ({ is_typing: true }),
      } as unknown as NextRequest;

      const params = Promise.resolve({ chatId: 'chat-123' });

      const response = await POST(req, { params });

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });
});
