export interface Preacher {
  id: number;
  username: string;
  displayName: string;
  email?: string;
  bio?: string;
  verified?: boolean;
}

export interface Mosque {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  qrCodeUrl: string;
  redirectUrl?: string;
  currentRoomId?: number;
  active: boolean;
  preacher?: Preacher;
}

export interface Room {
  id: number;
  roomId: number;
  title?: string;
  description?: string;
  status: "ACTIVE" | "ENDED" | "PENDING";
  listenerCount?: number;
  totalViews?: number;
  endedAt?: string;
  mosque?: Mosque;
  creator?: Preacher;
}

export interface ToastMessage {
  message: string;
  type: "success" | "error" | "info" | "warning";
}
