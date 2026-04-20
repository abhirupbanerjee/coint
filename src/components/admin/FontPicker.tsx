'use client'

import { useEffect, useMemo, useState } from 'react'
import { GOOGLE_FONTS, type FontCategory, fontStack } from '@/lib/googleFonts'

type FilterCategory = FontCategory | 'all'

interface FontPickerProps {
  label: string
  value: string
  onChange: (family: string) => void
  /** Categories the picker should expose. Defaults to all. */
  allowedCategories?: FontCategory[]
  /** Text rendered in the option preview line. */
  sampleText: string
}

const CATEGORY_LABELS: Record<FilterCategory, string> = {
  all: 'All',
  serif: 'Serif',
  'sans-serif': 'Sans',
  display: 'Display',
  monospace: 'Mono',
  handwriting: 'Script',
}

const loadedFonts = new Set<string>()

function ensureFontLoaded(family: string) {
  if (typeof document === 'undefined' || loadedFonts.has(family)) return
  loadedFonts.add(family)
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;600&display=swap`
  document.head.appendChild(link)
}

export default function FontPicker({ label, value, onChange, allowedCategories, sampleText }: FontPickerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FilterCategory>('all')

  const visibleCategories = useMemo<FilterCategory[]>(() => {
    const base: FilterCategory[] = ['all', 'serif', 'sans-serif', 'display', 'monospace', 'handwriting']
    if (!allowedCategories) return base
    return ['all', ...allowedCategories]
  }, [allowedCategories])

  const filteredFonts = useMemo(() => {
    const q = query.trim().toLowerCase()
    return GOOGLE_FONTS.filter(f => {
      if (allowedCategories && !allowedCategories.includes(f.category)) return false
      if (category !== 'all' && f.category !== category) return false
      if (q && !f.family.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, category, allowedCategories])

  // Eagerly load every visible font so the preview lines render in their true face.
  useEffect(() => {
    filteredFonts.forEach(f => ensureFontLoaded(f.family))
    ensureFontLoaded(value)
  }, [filteredFonts, value])

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500" style={{ fontFamily: fontStack(value) }}>
          Currently: {value}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        <input
          type="search"
          placeholder="Search fonts…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 min-w-[160px] px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value as FilterCategory)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {visibleCategories.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
      </div>

      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-100">
        {filteredFonts.length === 0 && (
          <div className="px-3 py-6 text-sm text-gray-400 text-center">No fonts match “{query}”.</div>
        )}
        {filteredFonts.map(f => {
          const selected = f.family === value
          return (
            <button
              key={f.family}
              type="button"
              onClick={() => onChange(f.family)}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                selected ? 'bg-gray-100' : ''
              }`}
            >
              <span className="w-4 shrink-0 text-gray-400">{selected ? '✓' : ''}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-gray-500">{f.family} · {CATEGORY_LABELS[f.category]}</span>
                <span
                  className="block text-lg text-gray-900 truncate"
                  style={{ fontFamily: fontStack(f.family) }}
                >
                  {sampleText}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
