'use client'

import { useMemo, useState, useDeferredValue } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Theme } from '@/lib/schema'

export interface ExplorerArticle {
  id: number
  title: string
  slug: string
  excerpt: string
  coverImageUrl: string | null
  coverImageAlt: string | null
  readingTime: number | null
  publishedDate: string
  primaryTheme: { id: number; name: string; slug: string } | null
  secondaryThemes: { id: number; name: string; slug: string }[]
  searchText: string
}

interface ArticlesExplorerProps {
  articles: ExplorerArticle[]
  themes: Theme[]
  initialThemeSlug?: string
}

export default function ArticlesExplorer({ articles, themes, initialThemeSlug }: ArticlesExplorerProps) {
  const [query, setQuery] = useState('')
  const [selectedThemeIds, setSelectedThemeIds] = useState<number[]>(() => {
    if (!initialThemeSlug) return []
    const t = themes.find(th => th.slug === initialThemeSlug)
    return t ? [t.id] : []
  })

  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase()
    const themeSet = new Set(selectedThemeIds)
    return articles.filter(a => {
      if (themeSet.size > 0) {
        const primaryMatch = a.primaryTheme && themeSet.has(a.primaryTheme.id)
        const secondaryMatch = a.secondaryThemes.some(s => themeSet.has(s.id))
        if (!primaryMatch && !secondaryMatch) return false
      }
      if (q && !a.searchText.includes(q)) return false
      return true
    })
  }, [articles, deferredQuery, selectedThemeIds])

  const toggleTheme = (id: number) => {
    setSelectedThemeIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]))
  }

  const clearAll = () => {
    setQuery('')
    setSelectedThemeIds([])
  }

  const hasFilters = query.trim() !== '' || selectedThemeIds.length > 0
  const isStale = query !== deferredQuery

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <label htmlFor="article-search" className="sr-only">Search articles</label>
        <div className="relative">
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles by title, idea, or keyword…"
            className="w-full px-4 py-3 pr-10 border border-border rounded-lg text-base bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Theme filter chips */}
      {themes.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {themes.map(t => {
              const selected = selectedThemeIds.includes(t.id)
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => toggleTheme(t.id)}
                  aria-pressed={selected}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground/70 border-border hover:border-primary hover:text-foreground'
                  }`}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Result count + clear */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
        <p className={`text-sm text-foreground/60 ${isStale ? 'opacity-60' : ''}`}>
          {filtered.length === 0
            ? 'No articles match.'
            : `${filtered.length} article${filtered.length === 1 ? '' : 's'}`}
          {hasFilters && ` — filtered`}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-foreground/60 hover:text-primary underline underline-offset-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-foreground/60">
          <p className="mb-2">Nothing matches your filters.</p>
          <button type="button" onClick={clearAll} className="text-primary hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map(article => (
            <li key={article.id}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block overflow-hidden rounded-lg border border-border hover:border-primary transition-all hover:shadow-md h-full flex flex-col"
              >
                <div className="aspect-video bg-muted relative overflow-hidden shrink-0">
                  {article.coverImageUrl ? (
                    <Image
                      src={article.coverImageUrl}
                      alt={article.coverImageAlt ?? article.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {article.primaryTheme && (
                    <p className="text-xs font-medium text-primary mb-2">{article.primaryTheme.name}</p>
                  )}
                  <h3 className="font-serif font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors mb-3">
                    {article.title}
                  </h3>
                  <p className="text-foreground/60 line-clamp-3 mb-4 flex-1">{article.excerpt}</p>
                  {article.secondaryThemes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {article.secondaryThemes.slice(0, 3).map(s => (
                        <span key={s.id} className="px-2 py-0.5 text-xs rounded-full bg-muted text-foreground/60">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs text-foreground/50 mt-auto">
                    <span>{article.readingTime || 5} min read</span>
                    <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
