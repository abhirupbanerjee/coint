'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

interface LikeButtonProps {
  slug: string
  initialLikes: number
}

export default function LikeButton({ slug, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    if (liked || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/likes/${slug}`, { method: 'POST' })
      const data = await res.json()
      setLikes(data.likes)
      if (!data.alreadyLiked) setLiked(true)
    } catch {
      // silently fail
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        disabled={liked || loading}
        aria-label={liked ? 'Already liked' : 'Like this article'}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
          liked
            ? 'border-red-300 bg-red-50 text-red-600 cursor-default'
            : 'border-border hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-foreground/60'
        }`}
      >
        <Heart size={18} className={liked ? 'fill-red-500 stroke-red-500' : ''} />
        <span className="text-sm font-medium">{likes}</span>
      </button>
      {!liked && <p className="text-sm text-foreground/50">Did you find this useful?</p>}
      {liked && <p className="text-sm text-foreground/60">Thanks for the like!</p>}
    </div>
  )
}
