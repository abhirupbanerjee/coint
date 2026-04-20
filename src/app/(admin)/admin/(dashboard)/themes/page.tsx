'use client'

import { useEffect, useState, useTransition } from 'react'

interface Theme {
  id: number
  name: string
  slug: string
  order: number
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[] | null>(null)
  const [error, setError] = useState('')
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState('')
  const [isPending, startTransition] = useTransition()

  const load = () => {
    fetch('/api/admin/themes')
      .then(r => r.json())
      .then((data: Theme[]) => setThemes(Array.isArray(data) ? data : []))
  }

  useEffect(() => {
    load()
  }, [])

  const loading = themes === null
  const themeList = themes ?? []

  const create = () => {
    const name = newName.trim()
    if (!name) return
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to create')
        return
      }
      setNewName('')
      load()
    })
  }

  const rename = (id: number, name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    setError('')
    startTransition(async () => {
      const res = await fetch(`/api/admin/themes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to rename')
        return
      }
      setEditingId(null)
      load()
    })
  }

  const remove = (id: number, name: string) => {
    if (!confirm(`Delete theme “${name}”? This cannot be undone.`)) return
    setError('')
    startTransition(async () => {
      const res = await fetch(`/api/admin/themes/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Failed to delete')
        return
      }
      load()
    })
  }

  const move = (id: number, delta: number) => {
    const idx = themeList.findIndex(t => t.id === id)
    const target = idx + delta
    if (idx < 0 || target < 0 || target >= themeList.length) return
    const a = themeList[idx]
    const b = themeList[target]
    setError('')
    startTransition(async () => {
      await Promise.all([
        fetch(`/api/admin/themes/${a.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: b.order }),
        }),
        fetch(`/api/admin/themes/${b.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: a.order }),
        }),
      ])
      load()
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Themes</h1>
      <p className="text-sm text-gray-600 mb-6">
        Themes group articles. Each article has one primary theme (required) and any number of secondary themes.
        Up to four themes can be featured on the home page (set in Home Page settings).
      </p>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Add a theme</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); create() } }}
            placeholder="Theme name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            type="button"
            onClick={create}
            disabled={isPending || !newName.trim()}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : themeList.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No themes yet. Add one above.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {themeList.map((t, idx) => (
              <li key={t.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(t.id, -1)}
                    disabled={idx === 0 || isPending}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 leading-none"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => move(t.id, 1)}
                    disabled={idx === themeList.length - 1 || isPending}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 leading-none"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === t.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') { e.preventDefault(); rename(t.id, editingName) }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      autoFocus
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                  ) : (
                    <>
                      <div className="font-medium text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-500">/{t.slug}</div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {editingId === t.id ? (
                    <>
                      <button
                        type="button"
                        onClick={() => rename(t.id, editingName)}
                        disabled={isPending}
                        className="px-3 py-1 text-sm bg-gray-900 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEditingId(t.id); setEditingName(t.name) }}
                        className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(t.id, t.name)}
                        disabled={isPending}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
