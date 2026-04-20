'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Article } from '@/lib/schema'

const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false })

const THEMES = [
  'Leadership and Perception',
  'Systems and Transformation',
  'Thinking in the Age of AI',
  'The Craft of Leadership',
]

interface ArticleFormProps {
  article?: Article
  mediaItems?: { url: string; filename: string; alt: string | null }[]
}

export default function ArticleForm({ article, mediaItems = [] }: ArticleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [title, setTitle] = useState(article?.title || '')
  const [theme, setTheme] = useState(article?.theme || THEMES[0])
  const [coverImageUrl, setCoverImageUrl] = useState(article?.coverImageUrl || '')
  const [coverImageAlt, setCoverImageAlt] = useState(article?.coverImageAlt || '')
  const [body, setBody] = useState(article?.body || '')
  const [excerpt, setExcerpt] = useState(article?.excerpt || '')
  const [featured, setFeatured] = useState(article?.featured || false)
  const [publishedDate, setPublishedDate] = useState(
    article?.publishedDate
      ? new Date(article.publishedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [status, setStatus] = useState(article?.status || 'draft')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    startTransition(async () => {
      try {
        const payload = { title, theme, coverImageUrl, coverImageAlt, body, excerpt, featured, publishedDate, status }
        const url = article ? `/api/admin/articles/${article.id}` : '/api/admin/articles'
        const method = article ? 'PUT' : 'POST'

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Failed to save')
          return
        }

        setSuccess('Saved successfully!')
        if (!article) {
          router.push('/admin/articles')
        }
        router.refresh()
      } catch {
        setError('Something went wrong')
      }
    })
  }

  const handleDelete = () => {
    if (!article) return
    if (!confirm('Delete this article? This cannot be undone.')) return
    startTransition(async () => {
      await fetch(`/api/admin/articles/${article.id}`, { method: 'DELETE' })
      router.push('/admin/articles')
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className={labelCls}>Title *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={inputCls} placeholder="Article title" />
        </div>

        {/* Theme */}
        <div>
          <label className={labelCls}>Theme *</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} className={inputCls}>
            {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Published Date */}
        <div>
          <label className={labelCls}>Published Date</label>
          <input type="date" value={publishedDate} onChange={e => setPublishedDate(e.target.value)} className={inputCls} />
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={e => setFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured article (shown on homepage)</label>
        </div>

        {/* Cover Image */}
        <div>
          <label className={labelCls}>Cover Image URL</label>
          {mediaItems.length > 0 && (
            <select
              className={`${inputCls} mb-2`}
              onChange={e => { if (e.target.value) setCoverImageUrl(e.target.value) }}
              defaultValue=""
            >
              <option value="">— Choose from media library —</option>
              {mediaItems.map(m => <option key={m.url} value={m.url}>{m.filename}</option>)}
            </select>
          )}
          <input type="text" value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} className={inputCls} placeholder="/media/image.jpg" />
        </div>

        {/* Cover Image Alt */}
        <div>
          <label className={labelCls}>Cover Image Alt Text</label>
          <input type="text" value={coverImageAlt} onChange={e => setCoverImageAlt(e.target.value)} className={inputCls} placeholder="Describe the image" />
        </div>

        {/* Excerpt */}
        <div className="md:col-span-2">
          <label className={labelCls}>Excerpt *</label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={3} className={inputCls} placeholder="Brief summary shown in article listings" />
        </div>
      </div>

      {/* Body */}
      <div>
        <label className={labelCls}>Article Body</label>
        <TipTapEditor
          content={body}
          onChange={setBody}
          placeholder="Write your article here. Use the toolbar to add YouTube videos, Twitter/X embeds, links, and images."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Saving…' : article ? 'Save Changes' : 'Create Article'}
        </button>
        {article && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-2 bg-red-50 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Delete Article
          </button>
        )}
      </div>
    </form>
  )
}
