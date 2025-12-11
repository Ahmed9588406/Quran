/**
 * Property-Based Tests for Chat Utility Functions
 * 
 * Uses fast-check to verify correctness properties hold across all valid inputs.
 * **Feature: real-time-chat-system**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sortChatsByRecent, filterChatsByQuery, filterMessagesByQuery } from './utils';
import { Chat, Message, Participant } from './types';

// ============================================================================
// Arbitraries (Generators)
// ============================================================================

/**
 * Generates a valid ISO timestamp string
 * Uses integer timestamps to avoid invalid date issues
 */
const timestampArb = fc.integer({
  min: new Date('2020-01-01T00:00:00.000Z').getTime(),
  max: new Date('2025-12-31T23:59:59.999Z').getTime(),
}).map(ts => new Date(ts).toISOString());

/**
 * Generates a valid participant
 */
const participantArb: fc.Arbitrary<Participant> = fc.record({
  id: fc.uuid(),
  username: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
  display_name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  avatar_url: fc.option(fc.webUrl(), { nil: undefined }),
  status: fc.constantFrom('online', 'offline') as fc.Arbitrary<'online' | 'offline'>,
  role: fc.option(fc.constantFrom('admin', 'member') as fc.Arbitrary<'admin' | 'member'>, { nil: undefined }),
});

/**
 * Generates a valid chat object
 */
const chatArb: fc.Arbitrary<Chat> = fc.record({
  id: fc.uuid(),
  type: fc.constantFrom('direct', 'group') as fc.Arbitrary<'direct' | 'group'>,
  title: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  participants: fc.array(participantArb, { minLength: 1, maxLength: 5 }),
  last_message: fc.option(fc.string({ minLength: 0, maxLength: 200 }), { nil: undefined }),
  last_message_at: fc.option(timestampArb, { nil: undefined }),
  unread_count: fc.nat({ max: 100 }),
  created_at: timestampArb,
});

/**
 * Generates a valid message object
 */
const messageArb: fc.Arbitrary<Message> = fc.record({
  id: fc.uuid(),
  chat_id: fc.uuid(),
  sender_id: fc.uuid(),
  sender_name: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  content: fc.string({ minLength: 0, maxLength: 500 }),
  type: fc.constantFrom('text', 'image', 'video', 'audio') as fc.Arbitrary<'text' | 'image' | 'video' | 'audio'>,
  attachments: fc.option(fc.array(fc.record({
    type: fc.constantFrom('image', 'video', 'audio', 'file') as fc.Arbitrary<'image' | 'video' | 'audio' | 'file'>,
    url: fc.webUrl(),
    filename: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  }), { minLength: 0, maxLength: 3 }), { nil: undefined }),
  media_url: fc.option(fc.webUrl(), { nil: undefined }),
  created_at: timestampArb,
  is_read: fc.boolean(),
});

// ============================================================================
// Property Tests
// ============================================================================

describe('Chat Utility Property Tests', () => {
  /**
   * **Feature: real-time-chat-system, Property 1: Chat list sorting**
   * 
   * *For any* list of conversations with timestamps, the displayed list SHALL be 
   * sorted in descending order by last_message_at (most recent first).
   * 
   * **Validates: Requirements 1.1**
   */
  describe('Property 1: Chat list sorting', () => {
    it('should sort chats in descending order by last_message_at (most recent first)', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 0, maxLength: 20 }),
          (chats) => {
            const sorted = sortChatsByRecent(chats);
            
            // Property: result length equals input length
            expect(sorted.length).toBe(chats.length);
            
            // Property: result is sorted in descending order by effective date
            for (let i = 0; i < sorted.length - 1; i++) {
              const dateA = new Date(sorted[i].last_message_at || sorted[i].created_at).getTime();
              const dateB = new Date(sorted[i + 1].last_message_at || sorted[i + 1].created_at).getTime();
              expect(dateA).toBeGreaterThanOrEqual(dateB);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not mutate the original array', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 1, maxLength: 10 }),
          (chats) => {
            const originalIds = chats.map(c => c.id);
            sortChatsByRecent(chats);
            const afterIds = chats.map(c => c.id);
            
            // Original array should be unchanged
            expect(afterIds).toEqual(originalIds);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all original chats (no additions or removals)', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 0, maxLength: 20 }),
          (chats) => {
            const sorted = sortChatsByRecent(chats);
            const originalIds = new Set(chats.map(c => c.id));
            const sortedIds = new Set(sorted.map(c => c.id));
            
            expect(sortedIds).toEqual(originalIds);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: real-time-chat-system, Property 3: Chat search filtering**
   * 
   * *For any* search query and list of conversations, all returned results SHALL match 
   * the query in participant name or last message content (case-insensitive).
   * 
   * **Validates: Requirements 1.4**
   */
  describe('Property 3: Chat search filtering', () => {
    it('should return only chats matching the query in participant name, last message, or title', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (chats, query) => {
            const filtered = filterChatsByQuery(chats, query);
            const normalizedQuery = query.toLowerCase().trim();
            
            // Property: all returned chats match the query
            for (const chat of filtered) {
              const participantMatch = chat.participants.some(p => {
                const displayName = p.display_name?.toLowerCase() || '';
                const username = p.username.toLowerCase();
                return displayName.includes(normalizedQuery) || username.includes(normalizedQuery);
              });
              const messageMatch = chat.last_message?.toLowerCase().includes(normalizedQuery) || false;
              const titleMatch = chat.title?.toLowerCase().includes(normalizedQuery) || false;
              
              expect(participantMatch || messageMatch || titleMatch).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all chats when query is empty', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 0, maxLength: 20 }),
          fc.constantFrom('', '   ', '\t', '\n'),
          (chats, emptyQuery) => {
            const filtered = filterChatsByQuery(chats, emptyQuery);
            expect(filtered.length).toBe(chats.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
          (chats, query) => {
            const lowerResult = filterChatsByQuery(chats, query.toLowerCase());
            const upperResult = filterChatsByQuery(chats, query.toUpperCase());
            const mixedResult = filterChatsByQuery(chats, query);
            
            // All case variations should return the same results
            expect(lowerResult.map(c => c.id).sort()).toEqual(upperResult.map(c => c.id).sort());
            expect(lowerResult.map(c => c.id).sort()).toEqual(mixedResult.map(c => c.id).sort());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return subset of original chats (no new chats added)', () => {
      fc.assert(
        fc.property(
          fc.array(chatArb, { minLength: 0, maxLength: 20 }),
          fc.string({ minLength: 0, maxLength: 20 }),
          (chats, query) => {
            const filtered = filterChatsByQuery(chats, query);
            const originalIds = new Set(chats.map(c => c.id));
            
            // All filtered chats must be from original set
            for (const chat of filtered) {
              expect(originalIds.has(chat.id)).toBe(true);
            }
            
            // Filtered count should not exceed original
            expect(filtered.length).toBeLessThanOrEqual(chats.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: real-time-chat-system, Property 15: Message search filtering**
   * 
   * *For any* search query within a conversation, all displayed messages SHALL contain 
   * the query string in their content (case-insensitive).
   * 
   * **Validates: Requirements 10.2**
   */
  describe('Property 15: Message search filtering', () => {
    it('should return only messages containing the query in content', () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
          (messages, query) => {
            const filtered = filterMessagesByQuery(messages, query);
            const normalizedQuery = query.toLowerCase().trim();
            
            // Property: all returned messages contain the query in content
            for (const message of filtered) {
              expect(message.content.toLowerCase().includes(normalizedQuery)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return all messages when query is empty', () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 0, maxLength: 50 }),
          fc.constantFrom('', '   ', '\t', '\n'),
          (messages, emptyQuery) => {
            const filtered = filterMessagesByQuery(messages, emptyQuery);
            expect(filtered.length).toBe(messages.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive', () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0),
          (messages, query) => {
            const lowerResult = filterMessagesByQuery(messages, query.toLowerCase());
            const upperResult = filterMessagesByQuery(messages, query.toUpperCase());
            
            // Both case variations should return the same results
            expect(lowerResult.map(m => m.id).sort()).toEqual(upperResult.map(m => m.id).sort());
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return subset of original messages (no new messages added)', () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 0, maxLength: 50 }),
          fc.string({ minLength: 0, maxLength: 20 }),
          (messages, query) => {
            const filtered = filterMessagesByQuery(messages, query);
            const originalIds = new Set(messages.map(m => m.id));
            
            // All filtered messages must be from original set
            for (const message of filtered) {
              expect(originalIds.has(message.id)).toBe(true);
            }
            
            // Filtered count should not exceed original
            expect(filtered.length).toBeLessThanOrEqual(messages.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should find messages when query matches exactly', () => {
      fc.assert(
        fc.property(
          fc.array(messageArb, { minLength: 1, maxLength: 20 }),
          (messages) => {
            // Pick a random message and use part of its content as query
            const randomIndex = Math.floor(Math.random() * messages.length);
            const targetMessage = messages[randomIndex];
            
            if (targetMessage.content.length > 0) {
              // Use first 5 chars or full content if shorter
              const query = targetMessage.content.slice(0, Math.min(5, targetMessage.content.length));
              const filtered = filterMessagesByQuery(messages, query);
              
              // The target message should be in the results
              expect(filtered.some(m => m.id === targetMessage.id)).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
