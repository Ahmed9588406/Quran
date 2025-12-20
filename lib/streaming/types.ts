/**
 * Streaming Types
 * Type definitions for live streaming functionality
 */

export interface Mosque {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  distance?: number; // in km
  imageUrl?: string;
  preacherId?: string;
  preacherName?: string;
}

export interface LiveStream {
  id: number;
  roomId: number;
  title: string;
  description?: string;
  mosqueId?: string;
  mosqueName?: string;
  preacherId?: string;
  preacherName?: string;
  preacherAvatar?: string;
  status: 'scheduled' | 'live' | 'ended';
  listeners: number;
  startedAt?: string;
  endedAt?: string;
  scheduledAt?: string;
  recordingAvailable: boolean;
  recordingUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StreamStats {
  totalRooms: number;
  activeStreams: number;
  totalListeners: number;
  totalRecordings: number;
}

export interface AdminDashboardStats {
  totalMosques: number;
  totalPreachers: number;
  totalStreams: number;
  activeStreams: number;
  totalListeners: number;
  totalRecordings: number;
}

export interface CreateStreamRequest {
  title: string;
  description?: string;
  mosqueId: string;
  preacherId?: string;
  scheduledAt?: string;
}

export interface UpdateStreamRequest {
  title?: string;
  description?: string;
  mosqueId?: string;
  preacherId?: string;
  scheduledAt?: string;
}

export interface StreamFilter {
  status?: 'all' | 'scheduled' | 'live' | 'ended';
  mosqueId?: string;
  preacherId?: string;
  search?: string;
  page?: number;
  size?: number;
}

export interface MapLocation {
  latitude: number;
  longitude: number;
  zoom?: number;
}

export interface NearestMosqueResult {
  mosque: Mosque;
  distance: number;
  bearing?: number;
}
