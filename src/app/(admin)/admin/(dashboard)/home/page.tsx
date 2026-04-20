'use client'

import { useEffect, useState, useTransition } from 'react'

interface Card { title: string; body: string }

export default function HomePageAdmin() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [heroHeading, setHeroHeading] = useState('')
  const [heroSubheading, setHeroSubheading] = useState('')
  const [heroBody, setHeroBody] = useState('')
  const [primaryCtaLabel, setPrimaryCtaLabel] = useState('')
  const [primaryCtaUrl, setPrimaryCtaUrl] = useState('')
  const [secondaryCtaLabel, setSecondaryCtaLabel] = useState('')
  const [secondaryCtaUrl, setSecondaryCtaUrl] = useState('')
  const [cards, setCards] = useState<Card[]>([{ title: '', body: '' }])

  useEffect(() => {
    fetch('/api/admin/globals?slug=home-page').then(r => r.json()).then(data => {
      setHeroHeading(data.heroHeading || '')
      setHeroSubheading(data.heroSubheading || '')
      setHeroBody(data.heroBody || '')
      setPrimaryCtaLabel(data.primaryCtaLabel || '')
      setPrimaryCtaUrl(data.primaryCtaUrl || '')
      setSecondaryCtaLabel(data.secondaryCtaLabel || '')
      setSecondaryCtaUrl(data.secondaryCtaUrl || '')
      if (data.coIntelligenceCards?.length) setCards(data.coIntelligenceCards)
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      await fetch('/api/admin/globals?slug=home-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heroHeading, heroSubheading, heroBody, primaryCtaLabel, primaryCtaUrl, secondaryCtaLabel, secondaryCtaUrl, coIntelligenceCards: cards }),
      })
      setSaved(true)
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">Home Page</h1>
      {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Saved!</div>}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">Hero Section</h2>
          <div><label className={labelCls}>Heading</label><input type="text" value={heroHeading} onChange={e => setHeroHeading(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Subheading</label><input type="text" value={heroSubheading} onChange={e => setHeroSubheading(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Body Text</label><textarea value={heroBody} onChange={e => setHeroBody(e.target.value)} rows={3} className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Primary CTA Label</label><input type="text" value={primaryCtaLabel} onChange={e => setPrimaryCtaLabel(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Primary CTA URL</label><input type="text" value={primaryCtaUrl} onChange={e => setPrimaryCtaUrl(e.target.value)} className={inputCls} placeholder="/articles" /></div>
            <div><label className={labelCls}>Secondary CTA Label</label><input type="text" value={secondaryCtaLabel} onChange={e => setSecondaryCtaLabel(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Secondary CTA URL</label><input type="text" value={secondaryCtaUrl} onChange={e => setSecondaryCtaUrl(e.target.value)} className={inputCls} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Co-Intelligence Cards</h2>
            <button type="button" onClick={() => setCards(c => [...c, { title: '', body: '' }])} className="text-xs text-gray-600 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50">+ Add Card</button>
          </div>
          {cards.map((card, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between"><span className="text-xs font-medium text-gray-500">Card {i + 1}</span><button type="button" onClick={() => setCards(c => c.filter((_, j) => j !== i))} className="text-xs text-red-500">Remove</button></div>
              <input type="text" value={card.title} onChange={e => setCards(c => c.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} className={inputCls} placeholder="Card title" />
              <textarea value={card.body} onChange={e => setCards(c => c.map((x, j) => j === i ? { ...x, body: e.target.value } : x))} rows={2} className={inputCls} placeholder="Card description" />
            </div>
          ))}
        </div>
        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save Home Page'}
        </button>
      </form>
    </div>
  )
}
