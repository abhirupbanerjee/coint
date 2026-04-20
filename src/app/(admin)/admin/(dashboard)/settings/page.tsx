'use client'

import { useEffect, useState, useTransition } from 'react'
import FontPicker from '@/components/admin/FontPicker'
import MediaLibraryPicker, { type UploadValidation, type ImageDimensions } from '@/components/admin/MediaLibraryPicker'
import type { Media } from '@/lib/schema'
import {
  DEFAULT_BODY_FONT,
  DEFAULT_HEADING_FONT,
  fontStack,
  resolveFont,
} from '@/lib/googleFonts'

const FAVICON_GOOD_TYPES = ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml']
const LOGO_GOOD_TYPES = ['image/png', 'image/svg+xml', 'image/webp']

function validateFavicon(file: File, dims: ImageDimensions | null): UploadValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const info: string[] = []

  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image.')
  } else if (!FAVICON_GOOD_TYPES.includes(file.type)) {
    warnings.push(`A favicon works best as PNG, ICO, or SVG — you uploaded ${file.type}. It will still display, but some browsers may not render it well.`)
  }

  if (file.size > 1024 * 1024) {
    warnings.push(`Favicon is ${(file.size / 1024).toFixed(0)} KB — favicons are usually under 100 KB. Consider compressing.`)
  }

  if (dims) {
    if (dims.width !== dims.height) {
      warnings.push(`Favicon is ${dims.width}×${dims.height}. Favicons should be square — browsers will squash or crop non-square images.`)
    }
    if (dims.width < 32) {
      warnings.push(`Favicon is only ${dims.width}px. We recommend at least 32×32 (ideally 512×512) so browsers can pick the right size.`)
    } else if (dims.width >= 512) {
      info.push(`Size ${dims.width}×${dims.height} — great, browsers can derive smaller sizes from this.`)
    } else {
      info.push(`Size ${dims.width}×${dims.height} — fine for browser tabs; for home-screen icons, a 512×512 version is recommended.`)
    }
  } else if (file.type === 'image/svg+xml') {
    info.push('SVG favicon detected — scales to any size automatically.')
  }

  return { errors, warnings, info }
}

function validateLogo(file: File, dims: ImageDimensions | null): UploadValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const info: string[] = []

  if (!file.type.startsWith('image/')) {
    errors.push('File must be an image.')
  } else if (!LOGO_GOOD_TYPES.includes(file.type)) {
    warnings.push(`Logo works best as PNG (with transparency), SVG, or WebP — you uploaded ${file.type}. Transparent backgrounds let the logo blend with the site.`)
  }

  if (file.size > 500 * 1024) {
    warnings.push(`Logo is ${(file.size / 1024).toFixed(0)} KB — try to keep logos under 200 KB so the header loads fast.`)
  }

  if (dims) {
    if (dims.height > 400) {
      warnings.push(`Logo is ${dims.width}×${dims.height}. It will render at ~40px tall in the header, so a source height of 80–200px is usually enough.`)
    } else if (dims.height < 40) {
      warnings.push(`Logo is only ${dims.height}px tall — it may look pixelated on high-DPI screens. 80–200px tall is a good target.`)
    } else {
      info.push(`Size ${dims.width}×${dims.height} — good for header use.`)
    }
    const ratio = dims.width / dims.height
    if (ratio > 8) {
      warnings.push('Logo is very wide — it may be truncated on small screens.')
    }
  } else if (file.type === 'image/svg+xml') {
    info.push('SVG logo detected — scales cleanly to any size.')
  }

  return { errors, warnings, info }
}

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [tagline, setTagline] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [headingFont, setHeadingFont] = useState(DEFAULT_HEADING_FONT)
  const [bodyFont, setBodyFont] = useState(DEFAULT_BODY_FONT)
  const [logoMedia, setLogoMedia] = useState<Media | null>(null)
  const [faviconMedia, setFaviconMedia] = useState<Media | null>(null)
  const [logoPickerOpen, setLogoPickerOpen] = useState(false)
  const [faviconPickerOpen, setFaviconPickerOpen] = useState(false)

  useEffect(() => {
    const loadAll = async () => {
      const [settings, mediaList] = await Promise.all([
        fetch('/api/admin/globals?slug=site-settings').then(r => r.json()),
        fetch('/api/admin/media').then(r => r.json() as Promise<Media[]>),
      ])
      setSiteName(settings.siteName || '')
      setTagline(settings.tagline || '')
      setContactEmail(settings.contactEmail || '')
      setLinkedinUrl(settings.linkedinUrl || '')
      setWhatsappNumber(settings.whatsappNumber || '')
      setHeadingFont(resolveFont(settings.headingFont, DEFAULT_HEADING_FONT))
      setBodyFont(resolveFont(settings.bodyFont, DEFAULT_BODY_FONT))
      if (settings.logoMediaId) {
        setLogoMedia(mediaList.find(m => m.id === settings.logoMediaId) ?? null)
      }
      if (settings.faviconMediaId) {
        setFaviconMedia(mediaList.find(m => m.id === settings.faviconMediaId) ?? null)
      }
    }
    loadAll()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(false)
    startTransition(async () => {
      await fetch('/api/admin/globals?slug=site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          tagline,
          contactEmail,
          linkedinUrl,
          whatsappNumber,
          headingFont,
          bodyFont,
          logoMediaId: logoMedia?.id ?? null,
          faviconMediaId: faviconMedia?.id ?? null,
        }),
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
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">General</h2>
          <div><label className={labelCls}>Site Name</label><input type="text" value={siteName} onChange={e => setSiteName(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Tagline</label><input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Contact Email</label><input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>LinkedIn URL</label><input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/..." /></div>
          <div><label className={labelCls}>WhatsApp Number</label><input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className={inputCls} placeholder="447911123456 (no + or spaces)" /></div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Branding</h2>
            <p className="text-xs text-gray-500 mt-1">
              Pick existing images from the media library or upload new ones inline. Uploads go into the shared media library.
            </p>
          </div>

          {/* Logo */}
          <div>
            <label className={labelCls}>Site logo</label>
            <p className="text-xs text-gray-500 mb-2">Shown in the header. If empty, the site name is shown as text.</p>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-32 h-12 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {logoMedia ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoMedia.url} alt={logoMedia.alt || 'Logo'} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-xs text-gray-400">No logo</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLogoPickerOpen(true)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded-md hover:border-gray-500 transition-colors"
              >
                {logoMedia ? 'Change logo' : 'Select logo'}
              </button>
              {logoMedia && (
                <button
                  type="button"
                  onClick={() => setLogoMedia(null)}
                  className="text-xs text-gray-500 hover:text-red-600 underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className={labelCls}>Favicon</label>
            <p className="text-xs text-gray-500 mb-2">Square icon shown in browser tabs and bookmarks.</p>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {faviconMedia ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={faviconMedia.url} alt={faviconMedia.alt || 'Favicon'} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[10px] text-gray-400">None</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFaviconPickerOpen(true)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded-md hover:border-gray-500 transition-colors"
              >
                {faviconMedia ? 'Change favicon' : 'Select favicon'}
              </button>
              {faviconMedia && (
                <button
                  type="button"
                  onClick={() => setFaviconMedia(null)}
                  className="text-xs text-gray-500 hover:text-red-600 underline"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Typography</h2>
            <p className="text-xs text-gray-500 mt-1">
              Fonts load from Google Fonts at runtime. If a font fails to load, the browser falls back to the category default (serif / sans-serif).
            </p>
          </div>

          <FontPicker
            label="Heading font"
            value={headingFont}
            onChange={setHeadingFont}
            allowedCategories={['serif', 'sans-serif', 'display']}
            sampleText="Cointelligence"
          />

          <FontPicker
            label="Body font"
            value={bodyFont}
            onChange={setBodyFont}
            allowedCategories={['serif', 'sans-serif']}
            sampleText="The quick brown fox jumps over the lazy dog."
          />

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Preview</p>
            <h3 className="text-3xl font-bold text-gray-900 leading-tight mb-3" style={{ fontFamily: fontStack(headingFont) }}>
              Editorial voices, thoughtful ideas
            </h3>
            <p className="text-base text-gray-700 leading-7" style={{ fontFamily: fontStack(bodyFont) }}>
              Leadership is not a formula — it is the daily practice of seeing what matters and doing the next right thing. Your writing here sets the tone for every reader who arrives.
            </p>
          </div>
        </section>

        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {isPending ? 'Saving…' : 'Save Settings'}
        </button>
      </form>

      <MediaLibraryPicker
        open={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={m => setLogoMedia(m)}
        title="Select site logo"
        allowUpload
        acceptMimeTypes="image/png,image/svg+xml,image/webp,image/jpeg"
        validate={validateLogo}
        guidance={
          <>
            <strong>Logo tips:</strong> use a transparent PNG or SVG so the logo blends with any background.
            Target height ~40px in the header (source of 80–200px tall is ideal). Keep file size under 200 KB.
            Very wide logos get truncated on narrow screens.
          </>
        }
      />

      <MediaLibraryPicker
        open={faviconPickerOpen}
        onClose={() => setFaviconPickerOpen(false)}
        onSelect={m => setFaviconMedia(m)}
        title="Select favicon"
        allowUpload
        acceptMimeTypes="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml"
        validate={validateFavicon}
        guidance={
          <>
            <strong>Favicon tips:</strong> square image (PNG, ICO, or SVG). Minimum 32×32; 512×512 recommended
            so browsers can derive all sizes (tab, bookmark, home-screen). Keep under 100 KB.
          </>
        }
      />
    </div>
  )
}
