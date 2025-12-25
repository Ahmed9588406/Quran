'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, UserPlus, UserCheck } from 'lucide-react'

interface Follower {
  id: string
  username: string
  display_name: string
  avatar_url?: string
  bio?: string
  is_following?: boolean
}

interface FollowersTabProps {
  userId: string
  isOwnProfile: boolean
}

export default function FollowersTab({ userId, isOwnProfile }: FollowersTabProps) {
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({})

  // Fetch followers
  useEffect(() => {
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
        } else {
          setFollowers((prev) => [...prev, ...normalizedFollowers])
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
      }
    }

    fetchFollowers()
  }, [userId, page])

  const handleLoadMore = () => {
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

  if (loading && followers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#7b2030] animate-spin mb-4" />
        <p className="text-gray-500">Loading followers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (followers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#f0e6e5] p-8 text-center">
        <p className="text-gray-500">No followers yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Followers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {followers.map((follower) => (
          <div
            key={follower.id}
            className="bg-white rounded-lg border border-[#f0e6e5] p-4 hover:shadow-md transition-shadow"
          >
            {/* Header with Avatar and Follow Button */}
            <div className="flex items-start justify-between mb-3">
              <Link href={`/other_user/${follower.id}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={follower.avatar_url}
                    alt={follower.display_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {follower.display_name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">@{follower.username}</p>
                  </div>
                </div>
              </Link>

              {!isOwnProfile && (
                <button
                  onClick={() => handleFollowToggle(follower.id)}
                  className={`ml-2 flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    followingMap[follower.id]
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-gradient-to-r from-[#7b2030] to-[#a02a3f] text-white hover:shadow-md'
                  }`}
                >
                  {followingMap[follower.id] ? (
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Following
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <UserPlus className="w-3 h-3" />
                      Follow
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Bio */}
            {follower.bio && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{follower.bio}</p>
            )}

            {/* View Profile Link */}
            <Link href={`/other_user/${follower.id}`}>
              <button className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#f0e6e5] to-[#e8d5cc] text-[#7b2030] font-medium text-sm hover:shadow-md transition-all">
                View Profile
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-6">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 bg-gradient-to-r from-[#7b2030] to-[#a02a3f] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
          >
            Load More Followers
          </button>
        </div>
      )}

      {loading && followers.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-[#7b2030] animate-spin" />
        </div>
      )}
    </div>
  )
}
