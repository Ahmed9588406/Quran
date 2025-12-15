'use client';

/**
 * Create Group Modal Component
 * 
 * Form for creating a new group chat with name and member selection.
 * Requirements: 8.1
 */

import React, { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { User } from '@/lib/chat/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://apisoapp.twingroups.com';

/**
 * Gets the authentication token from localStorage
 * Checks multiple possible keys for compatibility
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try different possible token keys
  const token = localStorage.getItem('access_token') 
    || localStorage.getItem('token')
    || localStorage.getItem('jwt')
    || localStorage.getItem('authToken');
  
  console.log('Auth token found:', token ? 'Yes' : 'No');
  return token;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  currentUserId: string;
  onClose: () => void;
  onGroupCreated?: (chatId: string) => void;
}

export default function CreateGroupModal({
  isOpen,
  currentUserId,
  onClose,
  onGroupCreated,
}: CreateGroupModalProps) {
  const [title, setTitle] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      console.error('No auth token found in localStorage');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/search/users?q=&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('جلسة منتهية الصلاحية. يرجى تسجيل الدخول مرة أخرى.');
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setUsers(data.users.filter((u: User) => u.id !== currentUserId));
      } else {
        setError(data.error || 'فشل تحميل المستخدمين');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('فشل تحميل المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      alert('الرجاء إدخال اسم المجموعة');
      return;
    }
    if (selectedUserIds.size === 0) {
      alert('الرجاء اختيار أعضاء للمجموعة');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً');
      console.error('No auth token found');
      return;
    }

    setIsCreating(true);
    setError(null);
    
    try {
      console.log('Creating group with:', {
        url: `${API_BASE}/chat/group/create`,
        title: title.trim(),
        member_ids: Array.from(selectedUserIds)
      });

      const response = await fetch(`${API_BASE}/chat/group/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          title: title.trim(), 
          member_ids: Array.from(selectedUserIds) 
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          alert('جلسة منتهية الصلاحية. يرجى تسجيل الدخول مرة أخرى.');
          return;
        }
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Create group response:', data);

      if (data.success) {
        // Reset form
        setTitle('');
        setSelectedUserIds(new Set());
        onClose();
        
        // Notify parent about the new group
        if (onGroupCreated && data.chat_id) {
          onGroupCreated(data.chat_id);
        }
        
        alert('تم إنشاء المجموعة بنجاح');
      } else {
        alert('فشل إنشاء المجموعة: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('حدث خطأ أثناء إنشاء المجموعة');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="w-6 h-6 text-[#667eea]" />
            إنشاء مجموعة جديدة
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم المجموعة
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أدخل اسم المجموعة"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#667eea] focus:border-transparent"
          />
        </div>

        {/* Member Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر الأعضاء ({selectedUserIds.size} مختار)
          </label>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#667eea]" />
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.has(user.id)}
                    onChange={() => toggleUser(user.id)}
                    className="w-4 h-4 text-[#667eea] rounded focus:ring-[#667eea]"
                  />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-white font-bold">
                    {(user.display_name || user.username).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {user.display_name || user.username}
                  </span>
                </label>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا يوجد مستخدمين
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 py-2.5 px-4 rounded-lg text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {isCreating ? 'جاري الإنشاء...' : 'إنشاء'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg bg-gray-200 text-gray-700 font-medium transition-colors hover:bg-gray-300"
          >
            إلغاء
          </button>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500">
          <p>API: {API_BASE}</p>
          <p>Token: {getAuthToken() ? '✓ Found' : '✗ Not found'}</p>
        </div>
      </div>
    </div>
  );
}
