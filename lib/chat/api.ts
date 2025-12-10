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
} from './types';

// Backend API base URL
const BASE_URL = 'http://192.168.1.18:9001';

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
    
    throw new ChatAPIError(errorMessage, response.status, errorCode);
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
 */
export class ChatAPI {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // Chat Operations
  // ============================================================================

  /**
   * Lists all chats for the current user.
   * 
   * Requirements: 1.1
   * 
   * @returns Promise resolving to array of Chat objects
   */
  async listChats(): Promise<Chat[]> {
    const response = await fetch(`${this.baseUrl}/chats`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<{ chats: Chat[] } | Chat[]>(response);
    
    // Handle both array and object response shapes
    if (Array.isArray(data)) {
      return data;
    }
    return data.chats || [];
  }

  /**
   * Creates a new direct chat with another user.
   * If a chat already exists, returns the existing chat ID.
   * 
   * Requirements: 2.2
   * 
   * @param targetUserId - ID of the user to start a chat with
   * @returns Promise resolving to CreateChatResponse with chat_id
   */
  async createChat(targetUserId: string): Promise<CreateChatResponse> {
    const response = await fetch(`${this.baseUrl}/chats`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
    
    return handleResponse<CreateChatResponse>(response);
  }

  /**
   * Gets detailed information about a specific chat.
   * 
   * @param chatId - ID of the chat to retrieve
   * @returns Promise resolving to ChatDetails object
   */
  async getChatDetails(chatId: string): Promise<ChatDetails> {
    const response = await fetch(`${this.baseUrl}/chats/${chatId}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<ChatDetails>(response);
  }


  // ============================================================================
  // Message Operations
  // ============================================================================

  /**
   * Gets messages for a specific chat.
   * Backend endpoint: /chat/:chat_id/messages?limit=50
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
    
    // Backend endpoint: /chat/:chat_id/messages?limit=50
    const url = `${this.baseUrl}/chat/${chatId}/messages?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<{ messages: Message[] } | Message[]>(response);
    
    // Handle both array and object response shapes
    if (Array.isArray(data)) {
      return data;
    }
    return data.messages || [];
  }

  /**
   * Sends a text message to a chat.
   * 
   * Requirements: 3.1
   * 
   * @param chatId - ID of the chat
   * @param content - Message text content
   * @returns Promise resolving to the created Message object
   */
  async sendMessage(chatId: string, content: string): Promise<Message> {
    const response = await fetch(`${this.baseUrl}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ content, type: 'text' }),
    });
    
    return handleResponse<Message>(response);
  }

  /**
   * Sends a media file (image, video, audio) to a chat.
   * 
   * Requirements: 6.1
   * 
   * @param chatId - ID of the chat
   * @param file - File to upload
   * @param type - Type of media ('image', 'video', 'audio')
   * @returns Promise resolving to the created Message object
   */
  async sendMedia(chatId: string, file: File, type: 'image' | 'video' | 'audio'): Promise<Message> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    // Don't set Content-Type header - browser will set it with boundary for multipart
    const headers: HeadersInit = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${this.baseUrl}/chats/${chatId}/media`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    return handleResponse<Message>(response);
  }

  /**
   * Deletes a message.
   * 
   * Requirements: 9.2
   * 
   * @param messageId - ID of the message to delete
   * @returns Promise resolving when deletion is complete
   */
  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/messages/${messageId}`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    await handleResponse<void>(response);
  }


  // ============================================================================
  // Group Operations
  // ============================================================================

  /**
   * Creates a new group chat.
   * 
   * Requirements: 8.1
   * 
   * @param title - Name of the group
   * @param memberIds - Array of user IDs to add as members
   * @returns Promise resolving to CreateGroupResponse with chat_id
   */
  async createGroup(title: string, memberIds: string[]): Promise<CreateGroupResponse> {
    const response = await fetch(`${this.baseUrl}/chats/group`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ title, member_ids: memberIds }),
    });
    
    return handleResponse<CreateGroupResponse>(response);
  }

  /**
   * Adds a member to a group chat.
   * 
   * Requirements: 8.4
   * 
   * @param chatId - ID of the group chat
   * @param userId - ID of the user to add
   * @returns Promise resolving when member is added
   */
  async addMember(chatId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chats/${chatId}/members`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ user_id: userId }),
    });
    
    await handleResponse<void>(response);
  }

  /**
   * Removes a member from a group chat.
   * 
   * Requirements: 8.5
   * 
   * @param chatId - ID of the group chat
   * @param userId - ID of the user to remove
   * @returns Promise resolving when member is removed
   */
  async removeMember(chatId: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chats/${chatId}/members/${userId}`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    await handleResponse<void>(response);
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  /**
   * Searches for users by query string.
   * 
   * Requirements: 2.1
   * 
   * @param query - Search query string
   * @returns Promise resolving to array of User objects
   */
  async searchUsers(query: string): Promise<User[]> {
    const params = new URLSearchParams({ q: query });
    
    const response = await fetch(`${this.baseUrl}/users/search?${params}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<{ users: User[] } | User[]>(response);
    
    // Handle both array and object response shapes
    if (Array.isArray(data)) {
      return data;
    }
    return data.users || [];
  }

  /**
   * Gets a list of available users for starting new chats.
   * 
   * @returns Promise resolving to array of User objects
   */
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<{ users: User[] } | User[]>(response);
    
    // Handle both array and object response shapes
    if (Array.isArray(data)) {
      return data;
    }
    return data.users || [];
  }

  /**
   * Gets details for a specific user.
   * 
   * @param userId - ID of the user
   * @returns Promise resolving to User object
   */
  async getUser(userId: string): Promise<User> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<User>(response);
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
