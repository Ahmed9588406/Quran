'use client';

/**
 * Connection Status Component
 * 
 * Displays WebSocket connection status badge.
 * Requirements: 11.3
 * 
 * **Feature: real-time-chat-system, Property 17: Connection status display**
 */

import React from 'react';
import { ConnectionStatus as ConnectionStatusType } from '@/lib/chat/types';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

const statusConfig: Record<ConnectionStatusType, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  connected: {
    label: 'متصل',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: <Wifi className="w-4 h-4" />,
  },
  connecting: {
    label: 'جاري الاتصال...',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  reconnecting: {
    label: 'إعادة الاتصال...',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  disconnected: {
    label: 'غير متصل',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: <WifiOff className="w-4 h-4" />,
  },
};

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
