'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import type { Media } from '@/lib/schema'

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([])
  const [isPending, startTransition] = useTransition()
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/media').then(r => r.json()).then(setItems)
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    form.append('alt', file.name.replace(/\.[^.]+$/, ''))
    const res = await fetch('/api/admin/media', { method: 'POST', body: form })
    if (res.ok) {
      const newItem = await res.json()
      setItems(i => [newItem, ...i])
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = (id: number) => {
    if (!confirm('Delete this image?')) return
    startTransition(async () => {
      await fetch('/api/admin/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      setItems(i => i.filter(m => m.id !== id))
    })
  }

  const copyUrl = async (item: Media) => {
    await navigator.clipboard.writeText(item.url)
    setCopied(item.id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">Media Library</h1>
        <label className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
          {uploading ? 'Uploading…' : '+ Upload Image'}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>
      {items.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No media yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <Image src={item.url} alt={item.alt || item.filename} fill className="object-cover" sizes="250px" />
              </div>
              <div className="p-2">
                <p className="text-xs text-gray-600 truncate mb-2">{item.filename}</p>
                <div className="flex gap-2">
                  <button onClick={() => copyUrl(item)} className="flex-1 text-xs py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
                    {copied === item.id ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} disabled={isPending} className="text-xs py-1 px-2 text-red-500 hover:text-red-700">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
