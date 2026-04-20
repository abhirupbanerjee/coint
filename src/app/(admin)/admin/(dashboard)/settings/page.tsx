'use client'

import { useEffect, useState, useTransition } from 'react'

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [tagline, setTagline] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    fetch('/api/admin/globals?slug=site-settings').then(r => r.json()).then(data => {
      setSiteName(data.siteName || '')
      setTagline(data.tagline || '')
      setContactEmail(data.contactEmail || '')
      setLinkedinUrl(data.linkedinUrl || '')
      setWhatsappNumber(data.whatsappNumber || '')
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      await fetch('/api/admin/globals?slug=site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, tagline, contactEmail, linkedinUrl, whatsappNumber }),
      })
      setSaved(true)
    })
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">Site Settings</h1>
      {saved && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Saved!</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 max-w-xl">
        <div><label className={labelCls}>Site Name</label><input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Tagline</label><input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Contact Email</label><input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>LinkedIn URL</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/..." /></div>
        <div><label className={labelCls}>WhatsApp Number</label><input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className={inputCls} placeholder="447911123456 (no + or spaces)" /></div>
        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
