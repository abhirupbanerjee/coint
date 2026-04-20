'use client'

import { useEffect, useState, useTransition } from 'react'

interface Engagement { title: string; description: string }

export default function WorkAdmin() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [introCopy, setIntroCopy] = useState('')
  const [engagements, setEngagements] = useState<Engagement[]>([{ title: '', description: '' }])

  useEffect(() => {
    fetch('/api/admin/globals?slug=work-page').then(r => r.json()).then(data => {
      setIntroCopy(data.introCopy || '')
      if (data.engagements?.length) setEngagements(data.engagements)
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      await fetch('/api/admin/globals?slug=work-page', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ introCopy, engagements }),
      })
      setSaved(true)
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">Work Page</h1>
      {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Saved!</div>}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Intro Copy</label>
          <textarea value={introCopy} onChange={e => setIntroCopy(e.target.value)} rows={4} className={inputCls} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Engagement Types</h2>
            <button type="button" onClick={() => setEngagements(e => [...e, { title: '', description: '' }])} className="text-xs text-gray-600 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50">+ Add</button>
          </div>
          {engagements.map((eng, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between"><span className="text-xs font-medium text-gray-500">Engagement {i + 1}</span><button type="button" onClick={() => setEngagements(e => e.filter((_, j) => j !== i))} className="text-xs text-red-500">Remove</button></div>
              <input type="text" value={eng.title} onChange={e => setEngagements(engs => engs.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} className={inputCls} placeholder="e.g. Speaking" />
              <textarea value={eng.description} onChange={e => setEngagements(engs => engs.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} rows={3} className={inputCls} />
            </div>
          ))}
        </div>
        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save Work Page'}
        </button>
      </form>
    </div>
  )
}
