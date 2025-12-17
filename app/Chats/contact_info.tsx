'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Link as LinkIcon, FileText, Image as ImageIcon } from 'lucide-react';
import { Chat, Message, Attachment } from '@/lib/chat/types';
import { getChatDisplayName, getChatAvatarUrl, isChatOnline } from '@/lib/chat/utils';
import { chatAPI, API_BASE_URL } from '@/lib/chat/api';
import { formatFileSize, truncateFilename } from '@/lib/chat/pdf-utils';

type Tab = 'Media' | 'links' | 'docs';

interface ContactInfoProps {
  chat: Chat;
  currentUserId: string;
  onClose: () => void;
  onDeleteChat?: () => void;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  messageId: string;
}

interface LinkItem {
  url: string;
  title: string;
  domain: string;
  messageId: string;
}

interface DocItem {
  url: string;
  filename: string;
  size?: number;
  type: string;
  messageId: string;
}

export default function ContactInfo({ chat, currentUserId, onClose, onDeleteChat }: ContactInfoProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Media');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [docItems, setDocItems] = useState<DocItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = getChatDisplayName(chat, currentUserId);
  const rawAvatarUrl = getChatAvatarUrl(chat, currentUserId);
  // Ensure avatar URL has the correct base URL
  const avatarUrl = rawAvatarUrl 
    ? (rawAvatarUrl.startsWith('http') ? rawAvatarUrl : `http://apisoapp.twingroups.com${rawAvatarUrl}`)
    : undefined;
  const isOnline = isChatOnline(chat, currentUserId);
  const initial = displayName.charAt(0).toUpperCase();

  // Get the other user's ID for navigation
  const getOtherUserId = () => {
    if (chat.type === 'direct') {
      const otherParticipant = chat.participants?.find(p => p.id !== currentUserId);
      return otherParticipant?.id || '';
    }
    return '';
  };

  // Extract URLs from text
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  // Get domain from URL
  const getDomain = (url: string): string => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  // Load media, links, and docs from messages
  useEffect(() => {
    const loadChatMedia = async () => {
      setIsLoading(true);
      try {
        const messages = await chatAPI.getMessages(chat.id, { limit: 100 });
        
        const media: MediaItem[] = [];
        const links: LinkItem[] = [];
        const docs: DocItem[] = [];

        messages.forEach((msg: Message) => {
          // Extract links from message content
          if (msg.content) {
            const urls = extractUrls(msg.content);
            urls.forEach(url => {
              links.push({
                url,
                title: msg.content.substring(0, 50),
                domain: getDomain(url),
                messageId: msg.id,
              });
            });
          }

          // Process attachments
          let attachments = msg.attachments;
          if (typeof attachments === 'string') {
            try {
              attachments = JSON.parse(attachments);
            } catch {
              attachments = undefined;
            }
          }

          if (attachments && Array.isArray(attachments)) {
            attachments.forEach((att: Attachment) => {
              const url = att.url.startsWith('http') ? att.url : `${API_BASE_URL}${att.url}`;
              
              if (att.type === 'image' || att.type === 'video') {
                media.push({
                  type: att.type,
                  url,
                  messageId: msg.id,
                });
              } else if (att.type === 'document' || att.type === 'pdf' || att.type === 'file') {
                docs.push({
                  url,
                  filename: att.filename || 'Document',
                  size: att.size,
                  type: att.mime_type || 'application/pdf',
                  messageId: msg.id,
                });
              }
            });
          }

          // Handle direct media_url
          if (msg.media_url) {
            const url = msg.media_url.startsWith('http') ? msg.media_url : `${API_BASE_URL}${msg.media_url}`;
            
            if (msg.type === 'image' || msg.type === 'video') {
              media.push({
                type: msg.type,
                url,
                messageId: msg.id,
              });
            }
          }
        });

        setMediaItems(media);
        setLinkItems(links);
        setDocItems(docs);
      } catch (error) {
        console.error('Error loading chat media:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChatMedia();
  }, [chat.id]);

  const totalCount = mediaItems.length + linkItems.length + docItems.length;

  // Navigate to user profile
  const handleNavigateToProfile = () => {
    const userId = getOtherUserId();
    if (userId) {
      router.push(`/other_user/${userId}`);
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <span className="font-medium text-gray-900">معلومات جهة الاتصال</span>
        <div className="w-8" />
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center py-6 border-b border-gray-100">
        <button 
          onClick={handleNavigateToProfile}
          className="flex flex-col items-center hover:opacity-80 transition-opacity"
        >
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mb-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="text-amber-700 font-semibold text-3xl">{initial}</span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
          <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
            {isOnline ? 'متصل' : 'غير متصل'}
          </p>
        </button>
      </div>

      {/* Media, Links, Docs Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section Header */}
        <button
          onClick={() => setActiveTab('Media')}
          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-700">الوسائط والروابط والمستندات</span>
          </div>
          <span className="text-sm text-gray-500">{totalCount}</span>
        </button>

        {/* Tabs */}
        <nav className="flex border-b border-gray-200">
          {(['Media', 'links', 'docs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-[#8A1538] border-b-2 border-[#8A1538]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab === 'Media' ? 'الوسائط' : tab === 'links' ? 'الروابط' : 'المستندات'}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8A1538]" />
            </div>
          ) : (
            <>
              {activeTab === 'Media' && (
                mediaItems.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1">
                    {mediaItems.map((item, i) => (
                      <div 
                        key={i} 
                        className="aspect-square rounded overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        {item.type === 'image' ? (
                          <img 
                            src={item.url} 
                            alt={`media ${i + 1}`} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-6 text-center">لا توجد وسائط</div>
                )
              )}

              {activeTab === 'links' && (
                linkItems.length > 0 ? (
                  <div className="space-y-3">
                    {linkItems.map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#dcf8c6] flex items-center justify-center flex-shrink-0">
                          <LinkIcon className="w-5 h-5 text-[#8A1538]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.domain}</p>
                          <p className="text-xs text-[#8A1538] truncate mt-1">{item.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-6 text-center">لا توجد روابط</div>
                )
              )}

              {activeTab === 'docs' && (
                docItems.length > 0 ? (
                  <div className="space-y-3">
                    {docItems.map((item, i) => (
                      <a
                        key={i}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-14 rounded-lg bg-[#dc3545] flex items-center justify-center flex-shrink-0 relative">
                          <span className="text-white font-bold text-xs">PDF</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {truncateFilename(item.filename, 30)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.size ? formatFileSize(item.size) : 'PDF'}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 py-6 text-center">لا توجد مستندات</div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Chat Button */}
      {onDeleteChat && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onDeleteChat}
            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>حذف المحادثة</span>
          </button>
        </div>
      )}
    </div>
  );
}
