import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { articles } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import sanitizeHtml from 'sanitize-html'

function sanitize(html: string) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe', 'figure', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 's']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow', 'title'],
      'img': ['src', 'alt', 'width', 'height', 'class', 'style'],
      'a': ['href', 'target', 'rel', 'class'],
      '*': ['class', 'id', 'data-youtube-video', 'data-tweet-url'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  })
}

function countReadingTime(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ')
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length
  return Math.max(1, Math.ceil(words / 200))
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const [article] = await db.select().from(articles).where(eq(articles.id, parseInt(id)))
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(article)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const body = await req.json()
    const { title, theme, coverImageUrl, coverImageAlt, body: rawBody, excerpt, featured, publishedDate, status } = body

    const cleanBody = sanitize(rawBody || '')
    const readingTime = countReadingTime(cleanBody)

    const [updated] = await db.update(articles)
      .set({
        title,
        theme,
        coverImageUrl: coverImageUrl || null,
        coverImageAlt: coverImageAlt || null,
        body: cleanBody,
        excerpt: excerpt || '',
        readingTime,
        featured: featured || false,
        publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
        status: status || 'draft',
        updatedAt: new Date(),
      })
      .where(eq(articles.id, parseInt(id)))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    await db.delete(articles).where(eq(articles.id, parseInt(id)))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
