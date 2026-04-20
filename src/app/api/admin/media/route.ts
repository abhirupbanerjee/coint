import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { media } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MEDIA_DIR = process.env.MEDIA_DIR || '/app/media'
const MEDIA_URL_BASE = '/media'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

export async function GET() {
  try {
    await requireAdmin()
    const all = await db.select().from(media).orderBy(desc(media.createdAt))
    return NextResponse.json(all)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin()
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const alt = formData.get('alt') as string || ''

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name)
    const basename = file.name.replace(ext, '').replace(/[^a-zA-Z0-9-_]/g, '-')
    const filename = `${basename}-${Date.now()}${ext}`

    await mkdir(MEDIA_DIR, { recursive: true })
    await writeFile(path.join(MEDIA_DIR, filename), buffer)

    const url = `${MEDIA_URL_BASE}/${filename}`
    const [row] = await db.insert(media).values({
      filename,
      url,
      alt,
      size: buffer.length,
      mimeType: file.type,
    }).returning()

    return NextResponse.json(row, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin()
    const { id } = await req.json()
    const [row] = await db.select().from(media).where(eq(media.id, id))
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { unlink } = await import('fs/promises')
    await unlink(path.join(MEDIA_DIR, row.filename)).catch(() => {})
    await db.delete(media).where(eq(media.id, id))

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
