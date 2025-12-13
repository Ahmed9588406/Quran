"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { Send, Smile, Mic, Square, ArrowLeft, X, Check, Image as ImageIcon, Video, FileText, Play, Pause, Volume2, VolumeX, Download, Loader2 } from "lucide-react";
import { chatAPI, API_BASE_URL } from "@/lib/chat/api";
import { Chat, Message } from "@/lib/chat/types";
import { useVoiceRecorder } from "@/lib/chat/useVoiceRecorder";

type ChatItem = {
  id: string; // chat_id
  name: string;
  avatar: string;
  snippet: string;
  time: string;
  unread?: boolean;
  isOnline?: boolean;
};

const BASE_URL = "http://192.168.1.18:9001";

// PDF utility functions (inline to avoid import issues)
function formatFileSize(bytes: number): string {
  if (bytes < 0 || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const base = 1024;
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(base)), units.length - 1);
  const value = bytes / Math.pow(base, unitIndex);
  if (unitIndex === 0) return `${Math.round(value)} ${units[unitIndex]}`;
  const formatted = value.toFixed(2).replace(/\.?0+$/, '');
  return `${formatted} ${units[unitIndex]}`;
}

function truncateFilename(filename: string, maxLength: number = 25): string {
  if (!filename) return '';
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    if (filename.length <= maxLength) return filename;
    return filename.slice(0, maxLength - 3) + '...';
  }
  const baseName = filename.slice(0, lastDotIndex);
  const extension = filename.slice(lastDotIndex);
  if (filename.length <= maxLength) return filename;
  const ellipsis = '...';
  const availableForBase = maxLength - ellipsis.length - extension.length;
  if (availableForBase <= 0) return ellipsis + extension;
  return baseName.slice(0, availableForBase) + ellipsis + extension;
}

// Emoji categories
const EMOJI_CATEGORIES = {
  'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛'],
  'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'],
  'Objects': ['🎉', '🎊', '🎁', '🎈', '🎀', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🎮', '🎯', '🎲', '🎭', '🎨'],
};

// Audio Player Component for voice messages - matches AudioMessage.tsx from Chats
function AudioPlayer({ src, isSent, duration: providedDuration }: { src: string; isSent: boolean; duration?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(providedDuration || 0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Generate stable waveform heights on mount - 40 bars like AudioMessage.tsx
  const waveformHeights = useMemo(() => {
    return Array.from({ length: 40 }, () => 20 + Math.random() * 60);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-w-[200px] max-w-[280px]">
      {/* Hidden audio element - no controls */}
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      
      {/* Custom Player Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/50"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white fill-white" />
          ) : (
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          )}
        </button>

        {/* Progress Section */}
        <div className="flex-1 min-w-0">
          {/* Waveform/Progress Bar */}
          <div
            onClick={handleSeek}
            className={`relative h-8 rounded-lg overflow-hidden cursor-pointer group mb-1 ${
              isSent ? 'bg-white/20' : 'bg-gray-200'
            }`}
          >
            {/* Progress Fill */}
            <div
              className="absolute inset-y-0 left-0 transition-all duration-100 bg-gradient-to-r from-blue-500 to-purple-600"
              style={{ width: `${progress}%` }}
            />
            
            {/* Waveform Effect */}
            <div className="absolute inset-0 flex items-center justify-around px-1">
              {waveformHeights.map((height, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-full transition-all ${
                    (i / 40) * 100 < progress
                      ? 'bg-white'
                      : isSent ? 'bg-white/40' : 'bg-gray-400'
                  }`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            
            {/* Hover Indicator */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          </div>

          {/* Time Display */}
          <div className={`flex justify-between text-[10px] px-1 ${
            isSent ? 'text-white/80' : 'text-gray-500'
          }`}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
            isSent ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isMuted ? (
            <VolumeX className={`w-4 h-4 ${isSent ? 'text-white/80' : 'text-gray-600'}`} />
          ) : (
            <Volume2 className={`w-4 h-4 ${isSent ? 'text-white/80' : 'text-gray-600'}`} />
          )}
        </button>
      </div>
    </div>
  );
}

// PDF Preview Component - matches PDFPreviewMessage.tsx from Chats
function PDFPreview({ url, filename, fileSize, pageCount, isSent }: { 
  url: string; 
  filename: string; 
  fileSize?: number; 
  pageCount?: number; 
  isSent: boolean; 
}) {
  const [downloadState, setDownloadState] = useState<'idle' | 'downloading' | 'downloaded'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

  const displayFilename = truncateFilename(filename, 25);
  const displayFileSize = fileSize ? formatFileSize(fileSize) : 'PDF';

  const handlePreviewClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (downloadState === 'downloading') return;
    
    setDownloadState('downloading');
    setDownloadProgress(0);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 30 + 10;
      if (progress >= 90) {
        progress = 90;
        clearInterval(progressInterval);
      }
      setDownloadProgress(Math.min(Math.round(progress), 90));
    }, 200);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      clearInterval(progressInterval);
      setDownloadProgress(100);
      setDownloadState('downloaded');
      setTimeout(() => {
        setDownloadState('idle');
        setDownloadProgress(0);
      }, 3000);
    }, 800);
  };

  const getDownloadIcon = () => {
    switch (downloadState) {
      case 'downloading': return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'downloaded': return <Check className="w-3 h-3" />;
      default: return <Download className="w-3 h-3" />;
    }
  };

  const getStatusText = () => {
    switch (downloadState) {
      case 'downloading': return `${downloadProgress}%`;
      case 'downloaded': return 'Downloaded';
      default: return displayFileSize;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 min-w-[200px] max-w-[260px] ${
        isSent ? 'bg-[#6b1029] hover:bg-[#5a0d22]' : 'bg-gray-100 hover:bg-gray-200'
      }`}
      onClick={handlePreviewClick}
    >
      {/* PDF Icon */}
      <div className="relative flex-shrink-0">
        <div className="w-10 h-12 rounded flex items-center justify-center relative bg-[#dc3545]">
          <div className={`absolute top-0 right-0 w-2 h-2 ${isSent ? 'bg-[#6b1029]' : 'bg-gray-100'}`} 
               style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
          <div className="absolute top-0 right-0 w-2 h-2 bg-[#b02a37] rounded-bl-sm" 
               style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
          <span className="text-white font-bold text-[10px] mt-1">PDF</span>
        </div>
        {downloadState === 'downloaded' && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/80 rounded">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-medium truncate ${isSent ? 'text-white' : 'text-gray-900'}`} title={filename}>
          {displayFilename}
        </div>
        <div className={`text-[10px] flex items-center gap-1 ${isSent ? 'text-white/70' : 'text-gray-500'}`}>
          <span className={downloadState === 'downloaded' ? 'text-green-400' : ''}>{getStatusText()}</span>
          {downloadState === 'idle' && pageCount && (
            <>
              <span>•</span>
              <span>{pageCount} {pageCount === 1 ? 'page' : 'pages'}</span>
            </>
          )}
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        disabled={downloadState === 'downloading'}
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
          downloadState === 'downloaded' 
            ? 'bg-green-500 text-white' 
            : downloadState === 'downloading'
              ? isSent ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-600'
              : isSent ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[#00a884] hover:bg-[#008f72] text-white'
        }`}
      >
        {getDownloadIcon()}
      </button>
    </div>
  );
}

function normalizeUrl(url?: string | null): string {
  if (!url) return "/icons/settings/profile.png";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}

function formatTime(timestamp?: string): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "numeric", day: "numeric" });
}

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function MessagesModal({
  isOpen,
  onClose,
  onOpenChat,
  onOpenStart,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (item: ChatItem) => void;
  onOpenStart?: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  
  // Chat view state
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Media & emoji state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const { isRecording, startRecording, stopRecording, error: recordingError } = useVoiceRecorder();

  // Get current user ID
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserId(user.id || "");
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch chats list
  const fetchChats = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    try {
      const chatList = await chatAPI.listChats();
      const items: ChatItem[] = chatList.map((chat: Chat) => {
        let name = chat.title || "Chat";
        let avatar = "/icons/settings/profile.png";
        let isOnline = false;

        if (chat.type === "direct") {
          // Check chat-level info first
          if (chat.display_name || chat.username) {
            name = chat.display_name || chat.username || "Unknown";
            avatar = normalizeUrl(chat.avatar_url);
            isOnline = chat.status === "online";
          }
          // Also check participants
          const other = chat.participants?.find((p) => p.id !== currentUserId);
          if (other) {
            if (!chat.display_name && !chat.username) {
              name = other.display_name || other.username;
              avatar = normalizeUrl(other.avatar_url);
            }
            isOnline = other.status === "online";
          }
        } else {
          name = chat.title || "Group";
        }

        return {
          id: chat.id,
          name,
          avatar,
          snippet: chat.last_message || "Start a conversation",
          time: formatTime(chat.last_message_at || chat.created_at),
          unread: chat.unread_count > 0,
          isOnline,
        };
      });
      setChats(items);
    } catch (err) {
      console.error("Error fetching chats:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, currentUserId]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;
    
    setMessagesLoading(true);
    try {
      const msgs = await chatAPI.getMessages(selectedChat.id);
      setMessages(msgs);
      // Mark as seen
      await chatAPI.markAsSeen(selectedChat.id).catch(() => {});
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (showChat && selectedChat) {
      fetchMessages();
    }
  }, [showChat, selectedChat, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 2 seconds when in chat view
  useEffect(() => {
    if (!showChat || !selectedChat) return;
    
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [showChat, selectedChat, fetchMessages]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowChat(false);
      setSelectedChat(null);
      setMessages([]);
      setMessageText("");
    }
  }, [isOpen]);

  // Close emoji picker and attach menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle outside click and escape
  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showChat) {
          goBack();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose, showChat]);

  // Open chat view
  const openChat = (chat: ChatItem) => {
    setSelectedChat(chat);
    setShowChat(true);
    setMessages([]);
    onOpenChat?.(chat);
  };

  // Go back to chat list
  const goBack = () => {
    setShowChat(false);
    setSelectedChat(null);
    setMessages([]);
    setMessageText("");
    fetchChats();
  };

  // Send message
  const handleSend = async () => {
    if (!messageText.trim() || !selectedChat || isSending) return;
    
    const content = messageText.trim();
    setMessageText("");
    setIsSending(true);
    
    // Optimistic update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      chat_id: selectedChat.id,
      sender_id: currentUserId,
      content,
      type: "text",
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages(prev => [...prev, tempMsg]);
    
    try {
      const sent = await chatAPI.sendMessage(selectedChat.id, content);
      setMessages(prev => prev.map(m => 
        m.id === tempMsg.id ? { ...sent, sender_id: sent.sender_id || currentUserId } : m
      ));
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setMessageText(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection for attachments
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedChat) return;

    let type: 'image' | 'video' | 'audio' | 'document' = 'image';
    if (file.type.startsWith('video/')) {
      type = 'video';
    } else if (file.type.startsWith('audio/')) {
      type = 'audio';
    } else if (
      file.type === 'application/pdf' ||
      file.type.includes('document') ||
      file.type.includes('spreadsheet') ||
      file.type.includes('presentation') ||
      file.type === 'text/plain' ||
      file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i)
    ) {
      type = 'document';
    }

    setIsSending(true);
    
    // Optimistic update with preview
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      chat_id: selectedChat.id,
      sender_id: currentUserId,
      content: type === 'image' ? '📷 Photo' : type === 'video' ? '🎬 Video' : type === 'audio' ? '🎵 Audio' : '📄 Document',
      type,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const sent = await chatAPI.sendMedia(selectedChat.id, file, type);
      setMessages(prev => prev.map(m => 
        m.id === tempMsg.id ? { ...sent, sender_id: sent.sender_id || currentUserId } : m
      ));
    } catch (err) {
      console.error("Error sending media:", err);
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setIsSending(false);
      // Reset file inputs
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (videoInputRef.current) videoInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle voice recording toggle
  const handleRecordingToggle = async () => {
    if (!selectedChat) return;
    
    if (isRecording) {
      const audioBlob = await stopRecording();
      if (audioBlob) {
        setIsSending(true);
        
        // Optimistic update
        const tempMsg: Message = {
          id: `temp-${Date.now()}`,
          chat_id: selectedChat.id,
          sender_id: currentUserId,
          content: '🎤 Voice message',
          type: 'audio',
          created_at: new Date().toISOString(),
          is_read: false,
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
          const file = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });
          const sent = await chatAPI.sendMedia(selectedChat.id, file, 'audio');
          setMessages(prev => prev.map(m => 
            m.id === tempMsg.id ? { ...sent, sender_id: sent.sender_id || currentUserId } : m
          ));
        } catch (err) {
          console.error("Error sending voice message:", err);
          setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
        } finally {
          setIsSending(false);
        }
      }
    } else {
      await startRecording();
    }
  };

  // Early return AFTER all hooks
  if (!isOpen) return null;

  // Helper to check if URL is a PDF
  const isPdfUrl = (url: string) => url.match(/\.pdf$/i) !== null;
  
  // Helper to check if URL is audio
  const isAudioUrl = (url: string) => url.match(/\.(mp3|wav|ogg|webm|m4a)$/i) !== null;
  
  // Helper to get filename from URL
  const getFilenameFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Document';
  };

  // Render media in message
  const renderMedia = (msg: Message, isSent: boolean) => {
    const mediaUrl = msg.media_url ? `${API_BASE_URL}${msg.media_url}` : null;
    
    let attachments = msg.attachments;
    if (typeof attachments === "string") {
      try { attachments = JSON.parse(attachments); } catch { attachments = undefined; }
    }
    
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      return attachments.map((att, idx) => {
        const url = att.url.startsWith("http") ? att.url : `${API_BASE_URL}${att.url}`;
        const filename = att.filename || getFilenameFromUrl(url);
        
        // Check for PDF first (priority)
        if (isPdfUrl(url) || att.type === 'pdf' || att.mime_type === 'application/pdf') {
          return (
            <div key={idx} className="mt-2">
              <PDFPreview 
                url={url} 
                filename={filename}
                fileSize={att.size}
                pageCount={att.pageCount}
                isSent={isSent} 
              />
            </div>
          );
        }
        
        // Check for images
        if (att.type === "image" || url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return (
            <img 
              key={idx} 
              src={url} 
              alt="Image" 
              className="max-w-full rounded-lg mt-2 cursor-pointer hover:opacity-90" 
              onClick={() => window.open(url, '_blank')}
            />
          );
        }
        
        // Check for videos
        if (att.type === "video" || url.match(/\.(mp4|webm|mov)$/i)) {
          return <video key={idx} src={url} controls className="max-w-full rounded-lg mt-2" />;
        }
        
        // Check for audio
        if (att.type === "audio" || isAudioUrl(url)) {
          return (
            <div key={idx} className="mt-2">
              <AudioPlayer src={url} isSent={isSent} />
            </div>
          );
        }
        
        // Check for other documents
        if (url.match(/\.(doc|docx|xls|xlsx|ppt|pptx|txt)$/i) || att.type === 'document') {
          return (
            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" 
               className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg ${isSent ? "bg-white/10 text-white/90" : "bg-gray-100 text-gray-700"}`}>
              <FileText className="w-5 h-5" />
              <span className="text-sm truncate">{filename}</span>
            </a>
          );
        }
        
        // Fallback for unknown types
        return (
          <a key={idx} href={url} target="_blank" rel="noopener noreferrer" 
             className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg ${isSent ? "bg-white/10 text-white/90" : "bg-gray-100 text-gray-700"}`}>
            <FileText className="w-5 h-5" />
            <span className="text-sm truncate">{filename}</span>
          </a>
        );
      });
    }
    
    // Handle direct media_url
    if (mediaUrl) {
      const filename = getFilenameFromUrl(mediaUrl);
      
      // Check for PDF first (priority)
      if (isPdfUrl(mediaUrl)) {
        return (
          <div className="mt-2">
            <PDFPreview 
              url={mediaUrl} 
              filename={filename}
              isSent={isSent} 
            />
          </div>
        );
      }
      
      // Check for images
      if (msg.type === "image" || mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        return (
          <img 
            src={mediaUrl} 
            alt="Image" 
            className="max-w-full rounded-lg mt-2 cursor-pointer hover:opacity-90" 
            onClick={() => window.open(mediaUrl, '_blank')}
          />
        );
      }
      
      // Check for videos
      if (msg.type === "video" || mediaUrl.match(/\.(mp4|webm|mov)$/i)) {
        return <video src={mediaUrl} controls className="max-w-full rounded-lg mt-2" />;
      }
      
      // Check for audio
      if (msg.type === "audio" || isAudioUrl(mediaUrl)) {
        return (
          <div className="mt-2">
            <AudioPlayer src={mediaUrl} isSent={isSent} />
          </div>
        );
      }
      
      // Check for documents
      if (msg.type === "document" || mediaUrl.match(/\.(doc|docx|xls|xlsx|ppt|pptx|txt)$/i)) {
        return (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer" 
             className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-lg ${isSent ? "bg-white/10 text-white/90" : "bg-gray-100 text-gray-700"}`}>
            <FileText className="w-5 h-5" />
            <span className="text-sm truncate">{filename}</span>
          </a>
        );
      }
    }
    return null;
  };

  return (
    <div className="fixed right-6 bottom-20 z-50" aria-modal="true" role="dialog">
      <div
        ref={ref}
        className="w-[360px] h-[520px] max-w-[92vw] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between flex-shrink-0 bg-[#fff6f3] border-b border-[#f0e6e5]">
          {!showChat ? (
            <>
              <div className="text-base font-bold text-[#7b2030]">Messages</div>
              <button onClick={onClose} className="text-[#7b2030] hover:bg-gray-100 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button onClick={goBack} className="text-[#7b2030] p-1 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative w-8 h-8">
                  <img 
                    src={selectedChat?.avatar || "/icons/settings/profile.png"} 
                    alt=""
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/icons/settings/profile.png"; }}
                  />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    selectedChat?.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{selectedChat?.name}</div>
                  <div className="text-xs text-gray-500">
                    {selectedChat?.isOnline ? <span className="text-green-500">Online</span> : "Offline"}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-[#7b2030] hover:bg-gray-100 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#F5E6D3]">
          {!showChat ? (
            /* Chat List */
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b2030]" />
                </div>
              ) : chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <span className="text-4xl mb-2">💬</span>
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => openChat(chat)}
                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/50 transition-colors"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <img 
                        src={chat.avatar} 
                        alt={chat.name}
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/icons/settings/profile.png"; }}
                      />
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#F5E6D3] ${
                        chat.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 truncate">{chat.name}</span>
                        <span className={`text-xs ${chat.unread ? "text-[#7b2030] font-bold" : "text-gray-400"}`}>
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-xs text-gray-500 truncate">{chat.snippet}</span>
                        {chat.unread && <span className="w-2 h-2 bg-[#7b2030] rounded-full" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Messages View */
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messagesLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b2030]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <span className="text-3xl mb-2">💬</span>
                    <p className="text-sm">Start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSent = msg.sender_id === currentUserId;
                    const hasMedia = msg.media_url || (msg.attachments && (typeof msg.attachments === 'string' ? JSON.parse(msg.attachments).length > 0 : msg.attachments.length > 0));
                    const isAudioMessage = msg.type === 'audio' || (msg.media_url && msg.media_url.match(/\.(mp3|wav|ogg|webm|m4a)$/i));
                    // Don't show placeholder text for audio messages with actual media
                    const showContent = msg.content && !(isAudioMessage && hasMedia && (msg.content === '🎤 Voice message' || msg.content === '🎵 Audio'));
                    
                    return (
                      <div key={msg.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm ${
                          isSent 
                            ? "bg-[#8A1538] text-white rounded-br-sm" 
                            : "bg-white text-gray-900 rounded-bl-sm"
                        }`}>
                          {showContent && (
                            <div className="text-sm break-words whitespace-pre-wrap">{msg.content}</div>
                          )}
                          {renderMedia(msg, isSent)}
                          <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                            isSent ? "text-white/70" : "text-gray-400"
                          }`}>
                            <span>{formatMessageTime(msg.created_at)}</span>
                            {isSent && (
                              <span className="flex">
                                {msg.is_read ? (
                                  <span className="flex -space-x-1">
                                    <Check className="w-3 h-3 text-blue-300" />
                                    <Check className="w-3 h-3 text-blue-300" />
                                  </span>
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="relative p-2 bg-white border-t border-gray-100 flex-shrink-0">
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-100">
                      <div className="flex gap-1 overflow-x-auto">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                          <button
                            key={category}
                            onClick={() => setActiveEmojiCategory(category)}
                            className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap transition-colors ${
                              activeEmojiCategory === category
                                ? 'bg-[#8A1538] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                    <div className="p-2 max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_CATEGORIES[activeEmojiCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => { setMessageText(prev => prev + emoji); }}
                            className="w-7 h-7 flex items-center justify-center text-lg hover:bg-gray-100 rounded"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Attachment Menu */}
                {showAttachMenu && (
                  <div 
                    ref={attachMenuRef}
                    className="absolute bottom-full left-8 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => { imageInputRef.current?.click(); setShowAttachMenu(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span>Photo</span>
                      </button>
                      <button
                        onClick={() => { videoInputRef.current?.click(); setShowAttachMenu(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Video className="w-4 h-4 text-purple-600" />
                        </div>
                        <span>Video</span>
                      </button>
                      <button
                        onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                        <span>Document</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Recording indicator */}
                {isRecording && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-600">Recording...</span>
                  </div>
                )}

                {/* Recording error */}
                {recordingError && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 mx-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {recordingError}
                  </div>
                )}

                {/* Hidden file inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-1">
                  {/* Mic button */}
                  <button
                    onClick={handleRecordingToggle}
                    disabled={isSending}
                    className={`p-2 rounded-full transition-all ${
                      isRecording
                        ? 'bg-red-500 animate-pulse'
                        : 'text-gray-500 hover:text-[#7b2030] hover:bg-gray-100'
                    }`}
                    title={isRecording ? 'Stop recording' : 'Voice message'}
                  >
                    {isRecording ? (
                      <Square className="w-4 h-4 text-white" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>

                  {/* Emoji button */}
                  <button 
                    onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowAttachMenu(false); }}
                    className={`p-2 rounded-full transition-colors ${
                      showEmojiPicker ? 'bg-[#8A1538] text-white' : 'text-gray-500 hover:text-[#7b2030] hover:bg-gray-100'
                    }`}
                  >
                    <Smile className="w-5 h-5" />
                  </button>

                  {/* Attachment button */}
                  <button 
                    onClick={() => { setShowAttachMenu(!showAttachMenu); setShowEmojiPicker(false); }}
                    className={`p-2 rounded-full transition-colors ${
                      showAttachMenu ? 'bg-[#8A1538] text-white' : 'text-gray-500 hover:text-[#7b2030] hover:bg-gray-100'
                    }`}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message"
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-1 focus:ring-[#7b2030]"
                    disabled={isSending || isRecording}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim() || isSending}
                    className={`p-2 rounded-full transition-colors ${
                      messageText.trim() 
                        ? "bg-[#8A1538] text-white hover:bg-[#6d1029]" 
                        : "text-gray-400"
                    }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Compose button - only in list view */}
        {!showChat && (
          <div className="absolute right-4 bottom-4">
            <button
              onClick={() => { onClose(); onOpenStart?.(); }}
              className="inline-flex items-center"
            >
              <Image src="/icons/start_message.png" alt="Compose" width={50} height={24} style={{ objectFit: "contain" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

