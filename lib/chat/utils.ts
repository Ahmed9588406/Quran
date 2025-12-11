/**
 * Chat Utility Functions
 * 
 * Helper functions for sorting, filtering, and formatting chat data.
 * Requirements: 1.1, 1.4, 10.2
 */

import { Chat, Message } from './types';

/**
 * Sorts chats by most recent activity (last_message_at) in descending order.
 * Chats without last_message_at are sorted by created_at.
 * 
 * Property 1: Chat list sorting
 * For any list of conversations with timestamps, the displayed list SHALL be 
 * sorted in descending order by last_message_at (most recent first).
 * Validates: Requirements 1.1
 * 
 * @param chats - Array of chat objects to sort
 * @returns New array sorted by most recent activity
 */
export function sortChatsByRecent(chats: Chat[]): Chat[] {
  return [...chats].sort((a, b) => {
    const dateA = a.last_message_at || a.created_at;
    const dateB = b.last_message_at || b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
}

/**
 * Filters chats by search query, matching against participant names or last message content.
 * 
 * Property 3: Chat search filtering
 * For any search query and list of conversations, all returned results SHALL match 
 * the query in participant name or last message content (case-insensitive).
 * Validates: Requirements 1.4
 * 
 * @param chats - Array of chat objects to filter
 * @param query - Search query string
 * @returns Filtered array of chats matching the query
 */
export function filterChatsByQuery(chats: Chat[], query: string): Chat[] {
  if (!query || query.trim() === '') {
    return chats;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return chats.filter(chat => {
    // Check participant names (display_name or username)
    const participantMatch = chat.participants.some(participant => {
      const displayName = participant.display_name?.toLowerCase() || '';
      const username = participant.username.toLowerCase();
      return displayName.includes(normalizedQuery) || username.includes(normalizedQuery);
    });
    
    // Check last message content
    const messageMatch = chat.last_message?.toLowerCase().includes(normalizedQuery) || false;
    
    // Check chat title (for group chats)
    const titleMatch = chat.title?.toLowerCase().includes(normalizedQuery) || false;
    
    return participantMatch || messageMatch || titleMatch;
  });
}


/**
 * Filters messages by search query, matching against message content.
 * 
 * Property 15: Message search filtering
 * For any search query within a conversation, all displayed messages SHALL contain 
 * the query string in their content (case-insensitive).
 * Validates: Requirements 10.2
 * 
 * @param messages - Array of message objects to filter
 * @param query - Search query string
 * @returns Filtered array of messages matching the query
 */
export function filterMessagesByQuery(messages: Message[], query: string): Message[] {
  if (!query || query.trim() === '') {
    return messages;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return messages.filter(message => {
    return message.content.toLowerCase().includes(normalizedQuery);
  });
}

/**
 * Formats a timestamp into a human-readable time string.
 * - Shows time (HH:MM) for today
 * - Shows day name for this week
 * - Shows date (MM/DD) for older messages
 * 
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Today: show time
  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  if (diffDays === 1 || (diffDays === 0 && date.getDate() !== now.getDate())) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && 
        date.getMonth() === yesterday.getMonth() && 
        date.getFullYear() === yesterday.getFullYear()) {
      return 'Yesterday';
    }
  }
  
  // This week: show day name
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Older: show date
  return date.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
}

/**
 * Formats a timestamp into a full time string for message display.
 * Always shows time in HH:MM format.
 * 
 * @param timestamp - ISO timestamp string
 * @returns Formatted time string (HH:MM)
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Truncates a string to a maximum length, adding ellipsis if truncated.
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated string with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Gets the display name for a chat.
 * For direct chats, returns the other participant's name.
 * For group chats, returns the chat title.
 * 
 * @param chat - Chat object
 * @param currentUserId - Current user's ID (to exclude from direct chat name)
 * @returns Display name for the chat
 */
export function getChatDisplayName(chat: Chat, currentUserId?: string): string {
  if (chat.type === 'group') {
    return chat.title || 'Group Chat';
  }
  
  // Backend may include user info directly on chat object for direct chats
  if (chat.display_name || chat.username) {
    return chat.display_name || chat.username || 'Unknown';
  }
  
  // For direct chats, find the other participant
  const otherParticipant = chat.participants?.find(p => p.id !== currentUserId);
  if (otherParticipant) {
    return otherParticipant.display_name || otherParticipant.username;
  }
  
  // Fallback to first participant
  const firstParticipant = chat.participants?.[0];
  return firstParticipant?.display_name || firstParticipant?.username || 'Unknown';
}

/**
 * Gets the avatar URL for a chat.
 * For direct chats, returns the other participant's avatar.
 * For group chats, returns undefined (use default group avatar).
 * 
 * @param chat - Chat object
 * @param currentUserId - Current user's ID
 * @returns Avatar URL or undefined
 */
export function getChatAvatarUrl(chat: Chat, currentUserId?: string): string | undefined {
  if (chat.type === 'group') {
    return undefined;
  }
  
  // Backend may include avatar_url directly on chat object
  if (chat.avatar_url) {
    return chat.avatar_url;
  }
  
  const otherParticipant = chat.participants?.find(p => p.id !== currentUserId);
  return otherParticipant?.avatar_url;
}

/**
 * Checks if any participant in a chat is online.
 * 
 * @param chat - Chat object
 * @param currentUserId - Current user's ID (to exclude)
 * @returns True if any other participant is online
 */
export function isChatOnline(chat: Chat, currentUserId?: string): boolean {
  // Backend may include status directly on chat object for direct chats
  if (chat.type === 'direct' && chat.status) {
    return chat.status === 'online';
  }
  
  return chat.participants?.some(p => p.id !== currentUserId && p.status === 'online') || false;
}
