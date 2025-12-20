/**
 * Streaming API Service
 * 
 * Provides typed API methods for live streaming operations including:
 * - Room management (create, list, delete, assign)
 * - Stream control (join, leave, end)
 * - Recording operations (start, stop, download, play)
 * - Listener tracking
 * 
 * Backend: Spring Boot API at http://apisoapp.twingroups.com/api/v1/stream
 */

// Backend API base URL (used by proxy routes)
export const STREAM_API_BASE_URL = 'https://noneffusive-reminiscent-tanna.ngrok-free.dev/api/v1/stream';

// Local proxy base URL (used by client-side code to avoid CORS)
export const STREAM_PROXY_BASE_URL = '/api/stream';

// Types
export interface LiveStreamRoom {
  id: number;
  roomId?: number;
  title?: string;
  description?: string;
  mosqueId?: string;
  mosqueName?: string;
  preacherId?: string;
  preacherName?: string;
  status?: 'active' | 'ended' | 'scheduled';
  listeners?: number;
  createdAt?: string;
  endedAt?: string;
  recordingAvailable?: boolean;
}

export interface CreateRoomRequest {
  title: string;
  description?: string;
  mosqueId: number; // Required by backend
  preacherId?: string;
}

export interface AssignRoomToMosqueRequest {
  mosqueId: string;
}

export interface ListenerCountResponse {
  liveStreamId: number;
  listeners: number;
}

export interface RoomDestroyResponse {
  liveStreamId: number;
  success: boolean;
  message: string;
}

export interface RecordingResponse {
  success: boolean;
  message: string;
  fileUrl?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface OldRoomInfo {
  roomId: number;
  title?: string;
  recordingAvailable: boolean;
  recordingUrl?: string;
}

/**
 * Custom error class for Streaming API errors
 */
export class StreamAPIError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'StreamAPIError';
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
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.error || errorCode;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new StreamAPIError(
      `Stream API Error: ${errorMessage} (Status: ${response.status})`,
      response.status,
      errorCode
    );
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

/**
 * Streaming API Service Class
 * Uses local Next.js API proxy routes to avoid CORS issues
 */
export class StreamAPI {
  private baseUrl: string;

  constructor(baseUrl: string = STREAM_PROXY_BASE_URL) {
    // Use local proxy routes by default to avoid CORS issues
    this.baseUrl = baseUrl;
  }

  // ============================================================================
  // Room Management (Admin Only)
  // ============================================================================

  /**
   * Create a new streaming room for a mosque (Admin only)
   * Proxy: POST /api/stream/rooms
   */
  async createRoom(request: CreateRoomRequest): Promise<LiveStreamRoom> {
    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify(request),
    });
    
    return handleResponse<LiveStreamRoom>(response);
  }

  /**
   * Get all rooms with pagination (Admin only)
   * Proxy: GET /api/stream/rooms?page=0&size=20
   */
  async getAllRooms(page: number = 0, size: number = 20): Promise<PaginatedResponse<LiveStreamRoom>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    const response = await fetch(`${this.baseUrl}/rooms?${params}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<PaginatedResponse<LiveStreamRoom>>(response);
  }

  /**
   * Get room by ID
   * Proxy: GET /api/stream/rooms/:id
   */
  async getRoomById(id: number): Promise<LiveStreamRoom> {
    const response = await fetch(`${this.baseUrl}/rooms/${id}`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LiveStreamRoom>(response);
  }

  /**
   * Delete a room (Admin only)
   * Proxy: DELETE /api/stream/rooms/:id
   */
  async deleteRoom(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/rooms/${id}`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    await handleResponse<void>(response);
  }

  /**
   * Assign room to mosque (Admin only)
   * Proxy: POST /api/stream/rooms/:roomId/assign
   */
  async assignRoomToMosque(roomId: number, mosqueId: string): Promise<LiveStreamRoom> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomId}/assign`, {
      method: 'POST',
      headers: createHeaders('application/json'),
      body: JSON.stringify({ mosqueId }),
    });
    
    return handleResponse<LiveStreamRoom>(response);
  }

  // ============================================================================
  // Preacher Operations
  // ============================================================================

  /**
   * Get preacher's assigned rooms (Preacher only)
   * Proxy: GET /api/stream/my-rooms
   */
  async getMyRooms(): Promise<LiveStreamRoom[]> {
    const response = await fetch(`${this.baseUrl}/my-rooms`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LiveStreamRoom[]>(response);
  }

  // ============================================================================
  // Stream Control
  // ============================================================================

  /**
   * Destroy a room (Admin only)
   * Proxy: DELETE /api/stream/:liveStreamId/room
   */
  async destroyRoom(liveStreamId: number): Promise<RoomDestroyResponse> {
    const response = await fetch(`${this.baseUrl}/${liveStreamId}/room`, {
      method: 'DELETE',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<RoomDestroyResponse>(response);
  }

  /**
   * User joins stream
   * Proxy: POST /api/stream/:liveStreamId/join?userId=:userId
   */
  async userJoin(liveStreamId: number, userId: number): Promise<ListenerCountResponse> {
    const response = await fetch(`${this.baseUrl}/${liveStreamId}/join?userId=${userId}`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<ListenerCountResponse>(response);
  }

  /**
   * User leaves stream
   * Proxy: POST /api/stream/:liveStreamId/leave?userId=:userId
   */
  async userLeave(liveStreamId: number, userId: number): Promise<ListenerCountResponse> {
    const response = await fetch(`${this.baseUrl}/${liveStreamId}/leave?userId=${userId}`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<ListenerCountResponse>(response);
  }

  /**
   * Get listener count
   * Proxy: GET /api/stream/:liveStreamId/listeners
   */
  async getListenerCount(liveStreamId: number): Promise<ListenerCountResponse> {
    const response = await fetch(`${this.baseUrl}/${liveStreamId}/listeners`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<ListenerCountResponse>(response);
  }

  /**
   * Get stream info
   * Proxy: GET /api/stream/:liveStreamId/info
   */
  async getStreamInfo(liveStreamId: number): Promise<LiveStreamRoom> {
    const response = await fetch(`${this.baseUrl}/${liveStreamId}/info`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<LiveStreamRoom>(response);
  }

  /**
   * End stream
   * Proxy: POST /api/stream/:liveStreamId/end
   */
  async endStream(liveStreamId: number): Promise<RoomDestroyResponse> {
    const response = await fetch(`${this.baseUrl}/${liveStreamId}/end`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<RoomDestroyResponse>(response);
  }

  // ============================================================================
  // Recording Operations
  // ============================================================================

  /**
   * Start recording
   * Proxy: POST /api/stream/:roomId/record/start
   */
  async startRecording(roomId: number): Promise<RecordingResponse> {
    const response = await fetch(`${this.baseUrl}/${roomId}/record/start`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<RecordingResponse>(response);
  }

  /**
   * Stop recording
   * Proxy: POST /api/stream/:roomId/record/stop
   */
  async stopRecording(roomId: number): Promise<RecordingResponse> {
    const response = await fetch(`${this.baseUrl}/${roomId}/record/stop`, {
      method: 'POST',
      headers: createHeaders('application/json'),
    });
    
    return handleResponse<RecordingResponse>(response);
  }

  /**
   * Get recording download URL (direct backend URL for file download)
   */
  getRecordingDownloadUrl(roomId: number): string {
    return `${STREAM_API_BASE_URL}/${roomId}/record/download`;
  }

  /**
   * Get recording play URL (direct backend URL for streaming)
   */
  getRecordingPlayUrl(roomId: number): string {
    return `${STREAM_API_BASE_URL}/${roomId}/record/play`;
  }

  /**
   * Get old rooms with recording info
   * Proxy: GET /api/stream/old-rooms
   */
  async getOldRooms(): Promise<Map<number, OldRoomInfo>> {
    const response = await fetch(`${this.baseUrl}/old-rooms`, {
      method: 'GET',
      headers: createHeaders('application/json'),
    });
    
    const data = await handleResponse<Record<string, OldRoomInfo>>(response);
    const map = new Map<number, OldRoomInfo>();
    
    Object.entries(data).forEach(([key, value]) => {
      map.set(parseInt(key), value);
    });
    
    return map;
  }
}

// Default instance
export const streamAPI = new StreamAPI();

// Factory function
export function createStreamAPI(baseUrl: string): StreamAPI {
  return new StreamAPI(baseUrl);
}
