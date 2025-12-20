/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Chat API Service
 * 
 * Provides typed API methods for all chat operations including:
 * - Chat listing and creation
 * - Message operations (send, get, delete)
 * - Media uploads
 * - Group management
 * - User search
 * 
 * Requirements: 1.1, 2.2, 3.1, 6.1, 8.1, 8.4, 8.5, 9.2
 */

import {
  Chat,
  ChatDetails,
  Message,
  MessageOptions,
  User,
  CreateChatResponse,
  CreateGroupResponse,
  APIError,
  Attachment, // <-- added
} from './types';

// Backend API base URL - matches the working backend
export const API_BASE_URL = 'http://apisoapp.twingroups.com';

/**
 * Custom error class for API errors
 */
export class ChatAPIError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'ChatAPIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

/**
 * Gets the authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

/**
 * Creates headers for API requests including authentication
 */
function createHeaders(contentType?: string): HeadersInit {
  const headers: HeadersInit = {};
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  
  return headers;
}


/**
 * Handles API response and throws appropriate errors
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    
    try {
      const errorData: APIError = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.error || errorCode;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    // Include status code in error message for better debugging
    const fullErrorMessage = `Failed to send message: ${errorMessage} (Status: ${response.status})`;
    throw new ChatAPIError(fullErrorMessage, response.status, errorCode);
  }
  
  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

/**
 * Chat API Service Class
 * 
 * Provides all REST API methods for the chat system.
 * Uses local Next.js API proxy routes to avoid CORS issues.
 * Proxy routes forward to backend at http://apisoapp.twingroups.com
 */
export class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/chats') {
    // Use local proxy routes by default to avoid CORS issues
    // Only use direct backend URL if explicitly provided
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // Chat Operations
  // ============================================================================

  /**
   * Lists all chats for the current user.
   * Proxy endpoint: GET /api/chats
   * 
   * Requirements: 1.1
   * 
   * @returns Promise resolving to array of Chat objects
   */
  async listChats(): Promise<Chat[]> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<Chat[]>(response);
    
    // Proxy returns array of chats directly
    return Array.isArray(data) ? data : [];
  }

  /**
   * Creates a new direct chat with another user.
   * If a chat already exists, returns the existing chat ID.
   * Proxy endpoint: POST /api/chats
   * 
   * Requirements: 2.2
   * 
   * @param targetUserId - ID of the user to start a chat with
   * @returns Promise resolving to CreateChatResponse with chat_id
   */
  async createChat(targetUserId: string): Promise<CreateChatResponse> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
    
    const data = await handleResponse<any>(response);
    return { chat_id: data.chat_id || data.id };
  }

  /**
   * Gets detailed information about a specific chat.
   * Proxy endpoint: GET /api/chats/:chatId
   * 
   * @param chatId - ID of the chat to retrieve
   * @returns Promise resolving to ChatDetails object
   */
  async getChatDetails(chatId: string): Promise<ChatDetails> {
    const response = await fetch(`${this.baseUrl}/${chatId}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<any>(response);
    return data.chat || data;
  }


  // ============================================================================
  // Message Operations
  // ============================================================================

  /**
   * Gets messages for a specific chat.
   * Proxy endpoint: GET /api/chats/:chatId/messages?limit=50
   * 
   * Requirements: 3.1
   * 
   * @param chatId - ID of the chat
   * @param options - Optional parameters for filtering/pagination
   * @returns Promise resolving to array of Message objects
   */
  async getMessages(chatId: string, options?: MessageOptions): Promise<Message[]> {
    const params = new URLSearchParams();
    
    // Default limit to 50
    params.append('limit', (options?.limit || 50).toString());
    
    if (options?.filter) {
      params.append('filter', options.filter);
    }
    if (options?.search) {
      params.append('search', options.search);
    }
    if (options?.before) {
      params.append('before', options.before);
    }
    if (options?.after) {
      params.append('after', options.after);
    }
    
    const url = `${this.baseUrl}/${chatId}/messages?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<Message[]>(response);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Sends a text message to a chat.
   * Proxy endpoint: POST /api/chats/:chatId/messages
   * 
   * Requirements: 3.1
   * 
   * @param chatId - ID of the chat
   * @param content - Message text content
   * @returns Promise resolving to the created Message object
   */
  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/${chatId}/messages`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ content }),
    });
    
    const data = await handleResponse<any>(response);
    
    // Return a message object - backend may return message_id or full message
    if (data.message) {
      return data.message;
    }
    
    // Construct message from response
    return {
      id: data.message_id || data.id || '',
      chat_id: chatId,
      sender_id: data.sender_id || '', // Will be filled by caller
      content,
      type: 'text',
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }

  /**
   * Sends a media file (image, video, audio, document) to a chat.
   * Backend endpoint: POST /chat/:chat_id/message/:type (image, video, audio)
   * Documents are sent via the 'image' endpoint as the backend handles all file types there.
   * 
   * Requirements: 6.1
   * 
   * @param chatId - ID of the chat
   * @param file - File to upload
   * @param type - Type of media ('image', 'video', 'audio', 'document')
   * @returns Promise resolving to the created Message object
   */
  async sendMedia(chatId: string, file: File, type: 'image' | 'video' | 'audio' | 'document'): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    // Don't set Content-Type header - browser will set it with boundary for multipart
    const headers: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Use the media upload endpoint
    const response = await fetch(`${this.baseUrl}/${chatId}/media`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await handleResponse<{ 
      success: boolean; 
      message_id?: string; 
      media_url?: string;
      attachments?: any; // keep as any from server
    }>(response);
    
    // Build attachments array - always include file metadata for proper display
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    // Narrow attachmentType to the allowed literal union
    let attachmentType: 'image' | 'video' | 'audio' | 'document' | 'pdf';
    if (type === 'document') {
      attachmentType = isPdf ? 'pdf' : 'document';
    } else {
      // type is one of 'image'|'video'|'audio' so assign directly
      attachmentType = type;
    }

    // Ensure attachments conforms to Attachment[] | undefined
    const attachments: Attachment[] | undefined = data.attachments
      ? (data.attachments as Attachment[])
      : (data.media_url ? [{
          type: attachmentType,
          url: data.media_url,
          filename: file.name,
          size: file.size,
          mime_type: file.type,
        } as Attachment] : undefined);
    
    return {
      id: data.message_id || '',
      chat_id: chatId,
      sender_id: '',
      content: '',
      type: type === 'document' ? 'document' : type,
      media_url: data.media_url,
      attachments,
      created_at: new Date().toISOString(),
      is_read: false,
    };
  }

  /**
   * Deletes a message.
   * Proxy endpoint: DELETE /api/chats/messages/:messageId
   * 
   * Requirements: 9.2
   * 
   * @param messageId - ID of the message to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`/api/chats/messages/${messageId}`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    await handleResponse<any>(response);
  }

  // ============================================================================
  // Typing Indicator
  // ============================================================================

  /**
   * Sends typing indicator to a chat via REST API.
   * Frontend endpoint: POST /api/chats/:chatId/typing
   * Backend endpoint: POST /chat/:chat_id/typing
   * Body: { "is_typing": true/false }
   * 
   * Requirements: 4.1
   * 
   * @param chatId - ID of the chat where user is typing
   * @param isTyping - Whether user is typing (default: true)
   * @returns Promise resolving when typing indicator is sent
   */
  async sendTyping(chatId: string, isTyping: boolean = true): Promise<void> {
    try {
      // Use frontend API route which proxies to backend
      const response = await fetch(`/api/chats/${chatId}/typing`, {
        method: 'POST',
        headers: createHeaders('application/json'),
        body: JSON.stringify({ is_typing: isTyping }),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to send typing indicator:', response.status, text);
        throw new ChatAPIError(
          'Failed to send typing indicator',
          response.status,
          'TYPING_ERROR'
        );
      }
      
      await handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
      // Don't throw - typing indicator is not critical
    }
  }

  /**
   * Marks messages as seen in a chat via REST API.
   * Frontend endpoint: POST /api/chats/:chatId/seen
   * Backend endpoint: POST /chat/:chat_id/seen
   * 
   * @param chatId - ID of the chat
   * @param messageId - Optional specific message ID to mark as seen
   * @returns Promise resolving when seen status is sent
   */
  async markAsSeen(chatId: string, messageId?: string): Promise<void> {
    try {
      // Use frontend API route which proxies to backend
      const body = messageId ? { message_id: messageId } : {};
      
      const response = await fetch(`/api/chats/${chatId}/seen`, {
        method: 'POST',
        headers: createHeaders('application/json'),
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to mark as seen:', response.status, text);
        throw new ChatAPIError(
          'Failed to mark messages as seen',
          response.status,
          'SEEN_ERROR'
        );
      }
      
      await handleResponse<{ success: boolean }>(response);
    } catch (error) {
      console.error('Error marking messages as seen:', error);
      // Don't throw - seen status is not critical
    }
  }


  // ============================================================================
  // Group Operations
  // ============================================================================

  /**
   * Creates a new group chat.
   * Proxy endpoint: POST /api/chats/group
   * Body: { "title": "Group Name", "members": ["USER_ID_1", "USER_ID_2"] }
   * 
   * Requirements: 8.1
   * 
   * @param title - Name of the group
   * @param memberIds - Array of user IDs to add as members
   * @returns Promise resolving to CreateGroupResponse with chat_id
   */
  async createGroup(title: string, memberIds: string[]): Promise<CreateGroupResponse> {
    const requestBody = { title, members: memberIds };
    
    console.log('Creating group with:', {
      url: `/api/chats/group`,
      body: requestBody,
    });
    
    const response = await fetch(`/api/chats/group`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify(requestBody),
    });
    
    // Log response for debugging
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Group creation failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // Try to parse as JSON for better error message
      try {
        const errorData = JSON.parse(errorText);
        throw new ChatAPIError(
          errorData.message || errorData.error || 'Failed to create group',
          response.status,
          errorData.error || 'GROUP_CREATE_ERROR'
        );
      } catch (e) {
        if (e instanceof ChatAPIError) throw e;
        throw new ChatAPIError(errorText || 'Failed to create group', response.status, 'GROUP_CREATE_ERROR');
      }
    }
    
    const data = await response.json();
    console.log('Group created successfully:', data);
    
    // Handle different response formats
    return { chat_id: data.chat_id || data.id || data.group_id };
  }

  /**
   * Adds a member to a group chat.
   * Proxy endpoint: POST /api/chats/group/:chatId/add
   * 
   * Requirements: 8.4
   * 
   * @param chatId - ID of the group chat
   * @param userId - ID of the user to add
   * @returns Promise resolving when member is added
   */
  async addMember(chatId: string, userId: string): Promise<void> {
    const response = await fetch(`/api/chats/group/${chatId}/add`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ user_id: userId }),
    });
    
    await handleResponse<any>(response);
  }

  /**
   * Removes a member from a group chat.
   * Proxy endpoint: DELETE /api/chats/group/:chatId/remove
   * 
   * Requirements: 8.5
   * 
   * @param chatId - ID of the group chat
   * @param userId - ID of the user to remove
   * @returns Promise resolving when member is removed
   */
  async removeMember(chatId: string, userId: string): Promise<void> {
    const response = await fetch(`/api/chats/group/${chatId}/remove`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ user_id: userId }),
    });
    
    await handleResponse<any>(response);
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  /**
   * Searches for users by query string.
   * Proxy endpoint: GET /api/users/search?q=&limit=100
   * 
   * Requirements: 2.1
   * 
   * @param query - Search query string
   * @param limit - Maximum number of results (default 100)
   * @returns Promise resolving to array of User objects
   */
  async searchUsers(query: string, limit: number = 100): Promise<User[]> {
    const params = new URLSearchParams({ q: query, limit: limit.toString() });
    
    const response = await fetch(`/api/users/search?${params}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<User[]>(response);
    return Array.isArray(data) ? data : [];
  }

  /**
   * Gets a list of available users for starting new chats.
   * Uses search endpoint with empty query
   * 
   * @returns Promise resolving to array of User objects
   */
  async getUsers(): Promise<User[]> {
    return this.searchUsers('', 100);
  }

  /**
   * Gets details for a specific user.
   * 
   * @param userId - ID of the user
   * @returns Promise resolving to User object
   */
  async getUser(userId: string): Promise<User> {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<any>(response);
    return data.user || data;
  }

  /**
   * Gets the current user's profile.
   * Proxy endpoint: GET /api/auth/profile
   * 
   * @returns Promise resolving to User object
   */
  async getProfile(): Promise<User> {
    const response = await fetch(`/api/auth/profile`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<any>(response);
    return data.user || data.data?.user || data;
  }
}

// ============================================================================
// Default Instance
// ============================================================================

/**
 * Default ChatAPI instance using the standard backend URL.
 * Import and use this for most cases.
 */
export const chatAPI = new ChatAPI();

/**
 * Creates a new ChatAPI instance with a custom base URL.
 * Useful for testing or connecting to different environments.
 * 
 * @param baseUrl - Custom base URL for the API
 * @returns New ChatAPI instance
 */
export function createChatAPI(baseUrl: string): ChatAPI {
  return new ChatAPI(baseUrl);
}
