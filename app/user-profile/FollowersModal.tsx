'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Loader2, UserPlus, UserCheck, X, Search } from 'lucide-react'

interface Follower {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  is_following?: boolean
}

interface FollowersModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  isOwnProfile: boolean
}

export default function FollowersModal({
  isOpen,
  onClose,
  userId,
  isOwnProfile,
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [filteredFollowers, setFilteredFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Fetch followers
  useEffect(() => {
    if (!isOpen) return

    const fetchFollowers = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('access_token')
        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const url = `http://apisoapp.twingroups.com/followers/${userId}?limit=20&page=${page}`
        const res = await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch followers')
        }

        const data = await res.json()
        const followersList = Array.isArray(data) ? data : data.followers || data.data || []

        // Normalize avatar URLs
        const normalizedFollowers = followersList.map((follower: any) => ({
          id: follower.id,
          username: follower.username,
          display_name: follower.display_name || follower.username,
          avatar_url: follower.avatar_url?.startsWith('http')
            ? follower.avatar_url
            : follower.avatar_url
            ? `http://apisoapp.twingroups.com${follower.avatar_url}`
            : '/icons/settings/profile.png',
          bio: follower.bio || '',
          is_following: follower.is_following || false,
        }))

        if (page === 1) {
          setFollowers(normalizedFollowers)
          setFilteredFollowers(normalizedFollowers)
        } else {
          setFollowers((prev) => [...prev, ...normalizedFollowers])
          setFilteredFollowers((prev) => [...prev, ...normalizedFollowers])
        }

        // Initialize following map
        const newFollowingMap: Record<string, boolean> = {}
        normalizedFollowers.forEach((f: Follower) => {
          newFollowingMap[f.id] = f.is_following || false
        })
        setFollowingMap((prev) => ({ ...prev, ...newFollowingMap }))

        // Check if there are more followers
        setHasMore(normalizedFollowers.length === 20)
      } catch (err) {
        console.error('Error fetching followers:', err)
        setError('Failed to load followers')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    }

    fetchFollowers()
  }, [isOpen, userId, page])

  // Filter followers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFollowers(followers)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = followers.filter(
        (f) =>
          f.display_name.toLowerCase().includes(query) ||
          f.username.toLowerCase().includes(query) ||
          f.bio?.toLowerCase().includes(query)
      )
      setFilteredFollowers(filtered)
    }
  }, [searchQuery, followers])

  const handleLoadMore = () => {
    setLoadingMore(true)
    setPage((prev) => prev + 1)
  }

  const handleFollowToggle = async (followerId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const isCurrentlyFollowing = followingMap[followerId]
      const endpoint = isCurrentlyFollowing ? 'unfollow' : 'follow'

      const res = await fetch(`/api/users/${followerId}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setFollowingMap((prev) => ({
          ...prev,
          [followerId]: !isCurrentlyFollowing,
        }))
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
    }
  }

  const handleClose = () => {
    setSearchQuery('')
    setPage(1)
    setFollowers([])
    setFilteredFollowers([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#f0e6e5] flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Followers</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#f0e6e5] flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search followers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#f0e6e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b2030] focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {loading && followers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#7b2030] animate-spin mb-4" />
              <p className="text-gray-500">Loading followers...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredFollowers.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">
                {searchQuery ? 'No followers match your search' : 'No followers yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredFollowers.map((follower) => (
                <div
                  key={follower.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {/* Follower Info */}
                  <Link href={`/other_user/${follower.id}`} onClick={handleClose}>
                    <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
                      <img
                        src={follower.avatar_url}
                        alt={follower.display_name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {follower.display_name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">@{follower.username}</p>
                      </div>
                    </div>
                  </Link>

                  {/* Follow Button */}
                  {!isOwnProfile && (
                    <button
                      onClick={() => handleFollowToggle(follower.id)}
                      className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        followingMap[follower.id]
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-[#7b2030] to-[#a02a3f] text-white hover:shadow-md'
                      }`}
                    >
                      {followingMap[follower.id] ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <UserPlus className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  )}
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && !loading && filteredFollowers.length > 0 && !searchQuery && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 bg-gradient-to-r from-[#7b2030] to-[#a02a3f] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}

              {loadingMore && followers.length > 0 && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 text-[#7b2030] animate-spin" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
