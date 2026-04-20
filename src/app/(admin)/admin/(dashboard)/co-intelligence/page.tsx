'use client'

import { useEffect, useState, useTransition } from 'react'
import dynamic from 'next/dynamic'

const TipTapEditor = dynamic(() => import('@/components/admin/TipTapEditor'), { ssr: false })

export default function CoIntelligenceAdmin() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [body, setBody] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/admin/globals?slug=co-intelligence-page').then(r => r.json()).then(data => {
      setBody(data.body || '')
      setLoaded(true)
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      await fetch('/api/admin/globals?slug=co-intelligence-page', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      setSaved(true)
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">Co-Intelligence Page</h1>
      {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Saved!</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {loaded && <TipTapEditor content={body} onChange={setBody} placeholder="Write the Co-Intelligence page content here…" />}
        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save Page'}
        </button>
      </form>
    </div>
  )
}
