import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params
  const filename = segments.join('/')

  if (filename.includes('..') || filename.includes('/')) {
    const safe = path.basename(filename)
    if (safe !== filename) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const filePath = path.join(MEDIA_DIR, path.basename(filename))
    const data = await readFile(filePath)
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'
    return new NextResponse(data, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
    })
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}
