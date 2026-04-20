'use client'

import { useEffect, useState, useTransition } from 'react'

export default function AboutAdmin() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [bioParagraphOne, setBioParagraphOne] = useState('')
  const [bioParagraphTwo, setBioParagraphTwo] = useState('')

  useEffect(() => {
    fetch('/api/admin/globals?slug=about-page').then(r => r.json()).then(data => {
      setBioParagraphOne(data.bioParagraphOne || '')
      setBioParagraphTwo(data.bioParagraphTwo || '')
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      await fetch('/api/admin/globals?slug=about-page', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bioParagraphOne, bioParagraphTwo }),
      })
      setSaved(true)
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">About Page</h1>
      {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Saved!</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-2xl">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">First Paragraph</label><textarea value={bioParagraphOne} onChange={e => setBioParagraphOne(e.target.value)} rows={5} className={inputCls} /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Second Paragraph</label><textarea value={bioParagraphTwo} onChange={e => setBioParagraphTwo(e.target.value)} rows={5} className={inputCls} /></div>
        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save About Page'}
        </button>
      </form>
    </div>
  )
}
