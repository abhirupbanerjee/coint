'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/lib/schema'

export interface ImageDimensions { width: number; height: number }

export interface UploadValidation {
  errors: string[]
  warnings: string[]
  info: string[]
}

export interface MediaLibraryPickerProps {
  open: boolean
  onClose: () => void
  onSelect: (media: Media) => void
  title?: string
  allowUpload?: boolean
  acceptMimeTypes?: string
  guidance?: React.ReactNode
  /** Validate before upload; return errors to block, warnings/info to advise. */
  validate?: (file: File, dimensions: ImageDimensions | null) => UploadValidation
}

async function readImageDimensions(file: File): Promise<ImageDimensions | null> {
  if (!file.type.startsWith('image/')) return null
  if (file.type === 'image/svg+xml') {
    return null
  }
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight }
      URL.revokeObjectURL(url)
      resolve(dims)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

export default function MediaLibraryPicker({
  open,
  onClose,
  onSelect,
  title = 'Select image',
  allowUpload = false,
  acceptMimeTypes = 'image/*',
  guidance,
  validate,
}: MediaLibraryPickerProps) {
  const [items, setItems] = useState<Media[] | null>(null)
  const [uploading, setUploading] = useState(false)
  const [validation, setValidation] = useState<UploadValidation | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch('/api/admin/media')
      .then(r => r.json())
      .then(data => { if (!cancelled) setItems(data) })
    return () => { cancelled = true }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    if (validate) {
      const dims = await readImageDimensions(file)
      setValidation(validate(file, dims))
    } else {
      setValidation(null)
    }
  }

  const clearPending = () => {
    setPendingFile(null)
    setValidation(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleUpload = async () => {
    if (!pendingFile) return
    setUploading(true)
    const form = new FormData()
    form.append('file', pendingFile)
    form.append('alt', pendingFile.name.replace(/\.[^.]+$/, ''))
    try {
      const res = await fetch('/api/admin/media', { method: 'POST', body: form })
      if (res.ok) {
        const newItem: Media = await res.json()
        setItems(i => [newItem, ...(i ?? [])])
        onSelect(newItem)
        clearPending()
      }
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  const blocked = !!validation?.errors.length

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 id="media-picker-title" className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {(guidance || allowUpload) && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200 space-y-3">
            {guidance && <div className="text-xs text-gray-600 leading-relaxed">{guidance}</div>}
            {allowUpload && (
              <div className="flex flex-wrap items-center gap-3">
                <label className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md hover:bg-gray-700 cursor-pointer transition-colors">
                  Choose file from computer
                  <input
                    ref={fileRef}
                    type="file"
                    accept={acceptMimeTypes}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {pendingFile && (
                  <>
                    <span className="text-xs text-gray-600 truncate max-w-[260px]">{pendingFile.name}</span>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={uploading || blocked}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {uploading ? 'Uploading…' : 'Upload & select'}
                    </button>
                    <button
                      type="button"
                      onClick={clearPending}
                      className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            )}
            {validation && (validation.errors.length > 0 || validation.warnings.length > 0 || validation.info.length > 0) && (
              <div className="space-y-1 text-xs">
                {validation.errors.map((m, i) => (
                  <div key={`e${i}`} className="text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">✕ {m}</div>
                ))}
                {validation.warnings.map((m, i) => (
                  <div key={`w${i}`} className="text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1">! {m}</div>
                ))}
                {validation.info.map((m, i) => (
                  <div key={`i${i}`} className="text-gray-700 bg-white border border-gray-200 rounded px-2 py-1">{m}</div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {items === null ? (
            <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No media yet.{allowUpload ? ' Upload one above.' : ' Upload images from the Media Library page first.'}
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { onSelect(item); onClose() }}
                  className="group text-left bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-900 hover:shadow focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                >
                  <div className="aspect-video bg-gray-100 relative">
                    <Image src={item.url} alt={item.alt || item.filename} fill className="object-cover" sizes="250px" />
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-gray-600 truncate">{item.filename}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
